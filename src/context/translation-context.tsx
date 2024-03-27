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
export type LanguageNameWithoutDetect = Exclude<LanguageName, "Detect">;

export type TranslationState = {
  input: string;
  selectedLanguage: LanguageName;
  detectedLanguage: LanguageName;
  targetLanguage: LanguageNameWithoutDetect;
  translatedText: string;
};

export type TranslationAction =
  | { type: "INPUT_CHANGE"; payload: string }
  | { type: "SELECTED_LANGUAGE_CHANGE"; payload: LanguageName }
  | { type: "DETECTED_LANGUAGE_CHANGE"; payload: LanguageName }
  | { type: "TARGET_LANGUAGE_CHANGE"; payload: LanguageNameWithoutDetect }
  | { type: "TRANSLATION_CHANGE"; payload: string }
  | { type: "INPUT_CLEAR" };

const initialState: TranslationState = {
  input: "",
  selectedLanguage: "Detect",
  detectedLanguage: "Detect",
  targetLanguage: "English",
  translatedText: "",
};

function translationReducer(
  state: TranslationState,
  action: TranslationAction
): TranslationState {
  switch (action.type) {
    case "INPUT_CHANGE":
      return { ...state, input: action.payload };
    case "SELECTED_LANGUAGE_CHANGE":
      return {
        ...state,
        selectedLanguage: action.payload,
        detectedLanguage: "Detect",
      };
    case "DETECTED_LANGUAGE_CHANGE":
      return { ...state, detectedLanguage: action.payload };
    case "TARGET_LANGUAGE_CHANGE":
      return { ...state, targetLanguage: action.payload };
    case "TRANSLATION_CHANGE":
      return { ...state, translatedText: action.payload };
    case "INPUT_CLEAR":
      return {
        ...state,
        input: "",
        translatedText: "",
        detectedLanguage: "Detect",
      };
    default:
      return state;
  }
}

const TranslationContext = React.createContext<
  [TranslationState, React.Dispatch<TranslationAction>] | undefined
>(undefined);

export const TranslationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = React.useReducer(translationReducer, initialState);

  return (
    <TranslationContext.Provider value={[state, dispatch]}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = React.useContext(TranslationContext);

  if (!context) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }

  return context;
};
