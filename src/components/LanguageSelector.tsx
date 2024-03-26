"use client";

import React from "react";
import { Tabs } from "./ui/Tabs";

const availableLanguages = [
  { code: "en", name: "English" },
  { code: "nl", name: "Dutch" },
  { code: "de", name: "German" },
] as const;

type Language = (typeof availableLanguages)[number];
type LanguageCode = Language["name"];

const LanguageSelector = () => {
  const [selectedLanguage, setSelectedLanguage] = React.useState<
    LanguageCode | "detect"
  >("English");
  const [detectText, setDetectText] = React.useState<string>("Detect language");

  const onLanguageChange = (language: string) => {
    const selectedLanguage = availableLanguages.find(
      (lang) => lang.name === language
    )?.name;
    console.log(selectedLanguage);

    if (!selectedLanguage && language !== "detect") return;

    setSelectedLanguage(selectedLanguage || "detect");
    //TODO - implement language detection
    // setDetectText(`${selectedLanguage} - detected`)
  };

  return (
    <div>
      <Tabs.Root value={selectedLanguage} onValueChange={onLanguageChange}>
        <Tabs.List>
          <Tabs.Tab key="detect" label="detect">
            {detectText}
          </Tabs.Tab>
          <>
            {availableLanguages.map((language) => (
              <Tabs.Tab key={language.code} label={language.name}>
                {language.name}
              </Tabs.Tab>
            ))}
          </>
        </Tabs.List>
        <></>
      </Tabs.Root>
    </div>
  );
};

export default LanguageSelector;
