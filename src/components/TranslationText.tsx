import React from "react";
import { useTranslation } from "@/context/translation-context";

import SaveTranslation from "./SaveTranslation";

const TranslationText = () => {
  const [translationState] = useTranslation();

  return (
    <div
      className={`h-40 rounded-lg px-3 py-2 bg-slate-50 overflow-y-auto relative pr-10`}
    >
      {translationState.status === "loading" && (
        <span className="animate-spin delay-100 absolute top-2 left-2 w-5 h-5 rounded-full border-2 border-slate-300 border-t-slate-600"></span>
      )}
      {translationState.status !== "loading" &&
        translationState.translatedText && <SaveTranslation />}
      {translationState.status !== "loading" && translationState.translatedText}
      {translationState.status === "error" && (
        <span className="text-rose-500 font-medium">
          {translationState.errorMessage}
        </span>
      )}
    </div>
  );
};

export default TranslationText;
