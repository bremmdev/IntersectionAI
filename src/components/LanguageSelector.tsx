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

  const handleLanguageChange = (value: string) => {
    const availableLanguageNames = availableLanguages.map((lang) => lang.name);
    if (
      value === "auto" ||
      availableLanguageNames.includes(value as LanguageName)
    ) {
      translationDispatch({
        type: "SELECTED_LANGUAGE_CHANGE",
        payload: value as LanguageName,
      });
    }
  };

  const detectedLanguageText =
    detectedLanguage !== "auto"
      ? `${detectedLanguage} - detected`
      : "Detect language";

  return (
    <div>
      <Tabs.Root
        value={selectedLanguage}
        onValueChange={(value) => handleLanguageChange(value)}
      >
        <Tabs.List aria-label="translation language selector">
          {availableLanguages.map((lang) => {
            return (
              <Tabs.Tab key={lang.code} label={lang.name}>
                {lang.code !== "auto" ? lang.name : detectedLanguageText}
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
