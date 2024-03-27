import React from "react";

import { Tabs } from "./ui/Tabs";
import { useTranslation } from "@/context/translation-context";
import type { LanguageName } from "@/context/translation-context";
import { languageNameToCode, languagesWithoutDetect } from "@/lib/utils";
import { translateText } from "@/_actions/translate";

const languages = languagesWithoutDetect();

const TargetLanguageSelector = () => {
  const {
    targetLanguage,
    setTargetLanguage,
    selectedLanguage,
    setTranslatedText,
    detectedLanguage,
    input,
  } = useTranslation();

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

  const handleLanguageChange = (value: string) => {
    const newTargetLanguage = value as LanguageName;
    setTargetLanguage(newTargetLanguage);
    let selectedLanguageCode: string | undefined = "";

    if (selectedLanguage === "Detect") {
      selectedLanguageCode = languageNameToCode(
        detectedLanguage as LanguageName
      );
    } else {
      selectedLanguageCode = languageNameToCode(selectedLanguage);
    }

    const newTargetLanguageCode = languageNameToCode(newTargetLanguage);

    if (newTargetLanguageCode && input && selectedLanguageCode) {
      translateInput(input, newTargetLanguageCode, selectedLanguageCode);
    }
  };

  return (
    <div>
      <Tabs.Root
        value={targetLanguage as LanguageName}
        onValueChange={handleLanguageChange}
      >
        <Tabs.List>
          {languages.map((lang) => {
            return (
              <Tabs.Tab key={lang.code} label={lang.name}>
                {lang.name}
              </Tabs.Tab>
            );
          })}
        </Tabs.List>
        <></>
      </Tabs.Root>
    </div>
  );
};

export default TargetLanguageSelector;
