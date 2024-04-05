"use client";

import React from "react";
import { Tabs } from "./ui/Tabs";

import {
  availableLanguages,
  useTranslation,
} from "@/context/translation-context";
import { useSearchParams, useRouter } from "next/navigation";
import {
  languageNameToCode,
  codeToLanguageName,
  sanitizeLanguage,
} from "@/lib/utils";

const LanguageSelector = () => {
  const [translationState] = useTranslation();

  const { detectedLanguage } = translationState;
  const searchParams = useSearchParams();

  const selectedLanguage = sanitizeLanguage(searchParams.get("from"));

  const router = useRouter();

  const handleLanguageChange = (value: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("from", languageNameToCode(value) || "auto");
    router.push("?" + newSearchParams.toString());
  };

  const detectedLanguageText =
    detectedLanguage !== "auto"
      ? `${detectedLanguage} - detected`
      : "Detect language";

  return (
    <div>
      <Tabs.Root
        value={codeToLanguageName(selectedLanguage)}
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
