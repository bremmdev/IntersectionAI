"use client";

import React from "react";
import { Star } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { saveTranslation } from "@/_actions/translation-actions";
import { useAuth } from "@clerk/nextjs";
import { useTranslation, LanguageName } from "@/context/translation-context";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { codeToLanguageName, sanitizeLanguage, sanitizeTargetLanguage } from "@/lib/utils";

const SaveTranslation = () => {
  const [translationState] = useTranslation();
  const searchParams = useSearchParams();

  const selectedLanguage = sanitizeLanguage(searchParams.get("from"))
  const targetLanguage = sanitizeTargetLanguage(searchParams.get("to"))

  const { userId } = useAuth();
  if (!userId) return null;

  const {
    input,
    translatedText,
    detectedLanguage,
  } = translationState;

  const handleSaveTranslation = async () => {
    const translationData = {
      from: selectedLanguage === "auto" ? detectedLanguage : codeToLanguageName(selectedLanguage) as LanguageName,
      fromText: input,
      to: codeToLanguageName(targetLanguage) as LanguageName,
      toText: translatedText,
    };

    const response = await saveTranslation(translationData)
    if (response?.error) {
      toast.error(response.error);
    } else {
      toast.success("Translation saved successfully");
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className="absolute top-2 right-2"
          aria-label="Save translation"
        >
          <Star
            size={32}
            onClick={handleSaveTranslation}
            className="stroke-slate-600 cursor-pointer hover:bg-slate-200 rounded-full p-1"
            aria-hidden
          />
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Save translation</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default SaveTranslation;
