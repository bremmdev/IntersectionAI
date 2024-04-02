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

const SaveTranslation = () => {
  const [translationState] = useTranslation();
  const { userId } = useAuth();
  if (!userId) return null;

  const {
    input,
    translatedText,
    selectedLanguage,
    detectedLanguage,
    targetLanguage,
  } = translationState;

  const handleSaveTranslation = async () => {
    const translationData = {
      from: selectedLanguage === "auto" ? detectedLanguage : selectedLanguage,
      fromText: input,
      to: targetLanguage,
      toText: translatedText,
    };

    const response = await saveTranslation(translationData);
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
