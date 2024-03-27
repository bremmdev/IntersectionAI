"use client";

import React from "react";
import { Tabs } from "./ui/Tabs";
import type { LanguageName } from "@/context/translation-context";

import {
  availableLanguages,
  useTranslation,
} from "@/context/translation-context";

const LanguageSelector = () => {
  const [translationState, translationDispatch] = useTranslation();

  const { detectedLanguage, selectedLanguage } = translationState;

  const onLanguageChange = (value: string) => {
    const availableLanguageNames = availableLanguages.map((lang) => lang.name);
    if (
      value === "Detect" ||
      availableLanguageNames.includes(value as LanguageName)
    ) {
      translationDispatch({
        type: "SELECTED_LANGUAGE_CHANGE",
        payload: value as LanguageName,
      });
    }
  };

  const detectedLanguageText =
    detectedLanguage !== "Detect"
      ? `${detectedLanguage} - detected`
      : "Detect language";

  return (
    <div>
      <Tabs.Root
        value={selectedLanguage}
        onValueChange={(value) => onLanguageChange(value)}
      >
        <Tabs.List>
          {availableLanguages.map((lang) => {
            return (
              <Tabs.Tab key={lang.code} label={lang.name}>
                {lang.code !== "detect" ? lang.name : detectedLanguageText}
              </Tabs.Tab>
            );
          })}
        </Tabs.List>
        <></>
      </Tabs.Root>
    </div>
  );
};

export default LanguageSelector;
