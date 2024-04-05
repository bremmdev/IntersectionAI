import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  availableLanguages,
  availableLanguageCodes,
} from "@/context/translation-context";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function languageNameToCode(name: string) {
  return availableLanguages.find((lang) => lang.name === name)?.code;
}

export function codeToLanguageName(code: string) {
  return availableLanguages.find((lang) => lang.code === code)?.name;
}

export function languagesWithoutDetect() {
  return availableLanguages.filter((lang) => lang.code !== "auto");
}

export function sanitizeTargetLanguage(targetLanguage: string | null) {
  return targetLanguage && availableLanguageCodes.includes(targetLanguage)
    ? targetLanguage
    : "en";
}

export function sanitizeLanguage(language: string | null) {
  return language && availableLanguageCodes.includes(language)
    ? language
    : "auto";
}