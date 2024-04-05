"use client";

import {
  TranslateSuccessResponse,
  TranslateResponse,
} from "@/_actions/translate";
import React from "react";

export const availableLanguages = [
  { code: "auto", name: "auto" },
  { code: "en", name: "English" },
  { code: "nl", name: "Dutch" },
  { code: "de", name: "German" },
] as const;

export const availableLanguageCodes = ["nl", "de", "en"]

export const availableTargetLanguages = [
  { code: "en", name: "English" },
  { code: "nl", name: "Dutch" },
  { code: "de", name: "German" },
] as const;

export type Language = (typeof availableLanguages)[number];
export type TargetLanguage = (typeof availableTargetLanguages)[number];
export type LanguageName = Language["name"];
export type TargetLanguageName = TargetLanguage["name"];

export type STATUS = "idle" | "loading" | "success" | "error";

type RecordingStatus = "idle" | "recording" | "stopped";

export type TranslationState = {
  input: string;
  detectedLanguage: LanguageName;
  translatedText: string;
  status: STATUS;
  errorMessage: string;
  recordingStatus: RecordingStatus;
};

export type TranslationAction =
  | { type: "INPUT_CHANGE"; payload: string }
  | { type: "DETECTED_LANGUAGE_CHANGE"; payload: LanguageName }
  | { type: "DETECTION_ERROR"; payload: { message: string } }
  | { type: "TRANSLATION_START" }
  | { type: "TRANSLATION_DONE"; payload: TranslateResponse }
  | { type: "INPUT_CLEAR" }
  | { type: "RECORDING_START" }
  | { type: "RECORDING_STOP" }
  | { type: "RECORDING_RESET" };

const initialState: TranslationState = {
  input: "",
  detectedLanguage: "auto",
  translatedText: "",
  status: "idle",
  errorMessage: "",
  recordingStatus: "idle",
};

function translationReducer(
  state: TranslationState,
  action: TranslationAction
): TranslationState {
  switch (action.type) {
    case "INPUT_CHANGE":
      return { ...state, input: action.payload };
    case "DETECTED_LANGUAGE_CHANGE":
      return { ...state, detectedLanguage: action.payload };
    case "DETECTION_ERROR":
      return {
        ...state,
        detectedLanguage: "auto",
        errorMessage: action.payload.message,
        status: "error",
        translatedText: "",
      };
    case "TRANSLATION_START":
      return { ...state, status: "loading", errorMessage: "" };
    case "TRANSLATION_DONE":
      if ("error" in action.payload) {
        return {
          ...state,
          translatedText: "",
          status: "error",
          errorMessage: action.payload.error.message,
        };
      }
      const translatedText = (action.payload as TranslateSuccessResponse)[0]
        .translations[0].text;
      return { ...state, translatedText, status: "success", errorMessage: "" };
    case "INPUT_CLEAR":
      return {
        ...state,
        input: "",
        translatedText: "",
        detectedLanguage: "auto",
        errorMessage: "",
        status: "idle",
      };
    case "RECORDING_START":
      return {
        ...state,
        recordingStatus: "recording",
        errorMessage: "",
        translatedText: "",
        status: "idle",
        input: "",
      };
    case "RECORDING_STOP":
      return { ...state, recordingStatus: "stopped" };
    case  "RECORDING_RESET":
      return { ...state, recordingStatus: "idle" };
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
