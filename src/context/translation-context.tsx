"use client";

import React from "react";

export const availableLanguages = [
  { code: "detect", name: "Detect" },
  { code: "en", name: "English" },
  { code: "nl", name: "Dutch" },
  { code: "de", name: "German" },
] as const;

export type Language = (typeof availableLanguages)[number];
export type LanguageName = Language["name"];

export type TranslationCtx = {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  //holds the language that the user selected manually
  selectedLanguage: LanguageName;
  setSelectedLanguage: React.Dispatch<React.SetStateAction<LanguageName>>;
  //holds the language that the system detected if the user selected detect
  detectedLanguage: LanguageName;
  setDetectedLanguage: React.Dispatch<React.SetStateAction<LanguageName>>;
  targetLanguage: Omit<LanguageName, "Detect">;
  setTargetLanguage: React.Dispatch<
    React.SetStateAction<Omit<LanguageName, "Detect">>
  >;
  translatedText: string;
  setTranslatedText: React.Dispatch<React.SetStateAction<string>>;
};

const TranslationContext = React.createContext({
  input: "",
  setInput: (input: string) => {},
  detectedLanguage: "Detect",
  setDetectedLanguage: (language: LanguageName) => {},
  selectedLanguage: "Detect",
  setSelectedLanguage: (selectedLanguage: LanguageName) => {},
  targetLanguage: "English" as Omit<LanguageName, "Detect">,
  setTargetLanguage: (targetLanguage: Omit<LanguageName, "Detect">) => {},
  translatedText: "",
  setTranslatedText: (translatedText: string) => {},  
});

export const TranslationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [input, setInput] = React.useState<string>("");
  const [detectedLanguage, setDetectedLanguage] =
    React.useState<LanguageName>("Detect");
  const [selectedLanguage, setSelectedLanguage] =
    React.useState<LanguageName>("Detect");
  const [targetLanguage, setTargetLanguage] =
    React.useState<Omit<LanguageName, "Detect">>("English");
    const [translatedText, setTranslatedText] = React.useState<string>("");

  return (
    <TranslationContext.Provider
      value={{
        input,
        setInput,
        detectedLanguage,
        setDetectedLanguage,
        selectedLanguage,
        setSelectedLanguage,
        targetLanguage,
        setTargetLanguage,
        translatedText,
        setTranslatedText,
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
};

export default TranslationProvider;

export const useTranslation = () => {
  const ctx = React.useContext(TranslationContext);

  if (!ctx) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }

  return ctx;
};
