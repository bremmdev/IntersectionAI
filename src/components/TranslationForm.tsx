"use client";

import React from "react";
import { Textarea } from "./ui/textarea";
import LanguageSelector from "./LanguageSelector";
import { useDebounce } from "@/hooks/useDebounce";
import { detectLanguage } from "@/_actions/translate";
import { useTranslation } from "@/context/translation-context";
import { availableLanguages, availableTargetLanguages } from "@/context/translation-context";
import type {
  LanguageName,
  TargetLanguageName,
} from "@/context/translation-context";
import { translateText } from "@/_actions/translate";
import { codeToLanguageName, languageNameToCode } from "@/lib/utils";
import TargetLanguageSelector from "./TargetLanguageSelector";
import TranslationText from "./TranslationText";

const TranslationForm = () => {
  const [translationState, translationDispatch] = useTranslation();

  const { input, selectedLanguage, targetLanguage } = translationState;

  const debouncedInput = useDebounce(input, 200);

  const translateInput = React.useCallback(
    async (
      debouncedInput: string,
      targetLanguage: string,
      fromLanguageCode?: string
    ) => {
      translationDispatch({ type: "TRANSLATION_START" });
      console.log('translating')

      const translatedData = await translateText(
        debouncedInput,
        targetLanguage,
        fromLanguageCode
      );

      translationDispatch({
        type: "TRANSLATION_DONE",
        payload: translatedData,
      });
    },
    [translationDispatch]
  );

  const detectLanguageAndTranslate = React.useCallback(async () => {
    const data = await detectLanguage(debouncedInput);

    //don't translate on error
    if ("error" in data) {
      translationDispatch({
        type: "DETECTION_ERROR",
        payload: data.error.message,
      });
      return;
    }

    //only support English, Dutch and German
    const supportedLanguages =  availableTargetLanguages.map(language => language.code) as string[];
    const detectedLanguageByService = data[0]?.language
    if (!supportedLanguages.includes(detectedLanguageByService)) {
      translationDispatch({
        type: "DETECTION_ERROR",
        payload: {
          message: `Detected language '${detectedLanguageByService}' is not supported. Please try again.`,
        },
      });
      return;
    }

    //no error and supported language, so translate

    //set detected language only if it is one of the available languages
    const availableLanguageCode = availableLanguages.map((lang) => lang.code);
    if (availableLanguageCode.includes(data[0].language)) {
      const detectedLanguage = codeToLanguageName(data[0].language);

      translateInput(
        debouncedInput,
        languageNameToCode(targetLanguage as TargetLanguageName) as string
      );

      translationDispatch({
        type: "DETECTED_LANGUAGE_CHANGE",
        payload: detectedLanguage as LanguageName,
      });
    } else {
      translationDispatch({
        type: "DETECTED_LANGUAGE_CHANGE",
        payload: "Detect",
      });
    }
  }, [debouncedInput, targetLanguage, translateInput, translationDispatch]);

  //when 'detect language' is selected, we want to detect the language and translate
  React.useEffect(() => {
    if (debouncedInput && selectedLanguage === "Detect") {
      detectLanguageAndTranslate();
    }
  }, [
    debouncedInput,
    selectedLanguage,
    detectLanguageAndTranslate,
    targetLanguage,
  ]);

  //when a language is selected, we want to translate the input
  React.useEffect(() => {
    if (debouncedInput && selectedLanguage !== "Detect") {
      const selectedLanguageCode = languageNameToCode(selectedLanguage);
      const targetLanguageCode = languageNameToCode(
        targetLanguage as TargetLanguageName
      );
      if (selectedLanguageCode && targetLanguage) {
        translateInput(
          debouncedInput,
          targetLanguageCode as string,
          selectedLanguageCode
        );
      }
    }
  }, [debouncedInput, selectedLanguage, targetLanguage, translateInput]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value === "") {
      translationDispatch({ type: "INPUT_CLEAR" });
      return;
    }

    translationDispatch({ type: "INPUT_CHANGE", payload: e.target.value });
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="basis-1/2">
        <form className="flex flex-col gap-4">
          <h2 className="text-lg text-primary-blue font-medium">
            Translate from
          </h2>
          <LanguageSelector />
          <Textarea
            aria-label="input text to translate"
            name="input"
            className="min-h-40 focus-visible:ring-primary-blue"
            onChange={handleTextChange}
          />
        </form>
      </div>
      <div className="basis-1/2 flex flex-col gap-4">
        <h2 className="text-lg text-primary-blue font-medium">Translate to</h2>
        <TargetLanguageSelector />
        <TranslationText />
      </div>
    </div>
  );
};

export default TranslationForm;
