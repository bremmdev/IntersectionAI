"use client";

import React from "react";
import { Textarea } from "./ui/textarea";
import LanguageSelector from "./LanguageSelector";
import { useDebounce } from "@/hooks/useDebounce";
import { detectLanguage } from "@/_actions/translate";
import { useTranslation } from "@/context/translation-context";
import { availableLanguages } from "@/context/translation-context";
import type { LanguageName } from "@/context/translation-context";
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
      const translatedData = await translateText(
        debouncedInput,
        targetLanguage,
        fromLanguageCode
      );

      translationDispatch({
        type: "TRANSLATION_CHANGE",
        payload: translatedData[0].translations[0].text as string,
      });
    },
    [translationDispatch]
  );

  const detectLanguageAndTranslate = React.useCallback(async () => {
    const data = await detectLanguage(debouncedInput);

    //set detected language only if it is one of the available languages
    const availableLanguageCode = availableLanguages.map((lang) => lang.code);
    if (availableLanguageCode.includes(data[0].language)) {
      const detectedLanguage = codeToLanguageName(data[0].language);

      translateInput(
        debouncedInput,
        languageNameToCode(targetLanguage as LanguageName) as string
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
  }, [debouncedInput, selectedLanguage, detectLanguageAndTranslate]);

  //when a language is selected, we want to translate the input
  React.useEffect(() => {
    if (debouncedInput && selectedLanguage !== "Detect") {
      const selectedLanguageCode = languageNameToCode(selectedLanguage);
      if (selectedLanguageCode && targetLanguage) {
        translateInput(
          debouncedInput,
          languageNameToCode(targetLanguage as LanguageName) as string,
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
