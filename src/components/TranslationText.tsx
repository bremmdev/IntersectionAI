import React from "react";
import { useTranslation } from "@/context/translation-context";

const TranslationText = () => {
  const [translationState] = useTranslation();

  return (
    <div className="h-40 rounded-lg px-3 py-2 bg-slate-50 overflow-y-auto">
      {translationState.translatedText}
      {translationState.status === "error" && (
        <span className="text-rose-500 font-medium">
          {translationState.errorMessage}
        </span>
      )}
    </div>
  );
};

export default TranslationText;
