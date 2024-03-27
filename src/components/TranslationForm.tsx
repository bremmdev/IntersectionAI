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
  const {
    selectedLanguage,
    setDetectedLanguage,
    input,
    setInput,
    setTranslatedText,
    targetLanguage,
  } = useTranslation();

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

      setTranslatedText(translatedData[0].translations[0].text as string);
    },
    [setTranslatedText]
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

      setDetectedLanguage(detectedLanguage as LanguageName);
    } else {
      setDetectedLanguage("Detect");
    }
  }, [debouncedInput, setDetectedLanguage, translateInput, targetLanguage]);

  //only call detection server action if user selects detect tab
  React.useEffect(() => {
    if (debouncedInput) {
      if (selectedLanguage === "Detect") {
        detectLanguageAndTranslate();
        return;
      }
      if (selectedLanguage) {
        const selectedLanguageCode = languageNameToCode(selectedLanguage);
        if (selectedLanguageCode) {
          translateInput(
            debouncedInput,
            languageNameToCode(targetLanguage as LanguageName) as string,
            selectedLanguageCode
          );
        }
      }
    }
    setDetectedLanguage("Detect");
    setTranslatedText("");
  }, [
    debouncedInput,
    selectedLanguage,
    setDetectedLanguage,
    detectLanguageAndTranslate,
    translateInput,
    targetLanguage,
    setTranslatedText,
  ]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
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
