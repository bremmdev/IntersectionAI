import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { availableLanguages } from "@/context/translation-context"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function languageNameToCode(name: string) {
  return availableLanguages.find((lang) => lang.name === name)?.code
}

export function codeToLanguageName(code: string) {
  return availableLanguages.find((lang) => lang.code === code)?.name
}

export function languagesWithoutDetect() {
  return availableLanguages.filter((lang) => lang.code !== "detect")
}