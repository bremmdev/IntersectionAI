import React from "react";
import { Volume2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslation } from "@/context/translation-context";
import { languageNameToCode } from "@/lib/utils";

const SpeechSynthesis = () => {
  const [translationState] = useTranslation();

  const speakOut = () => {
    //cancel any previous speech synthesis
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(
      translationState.translatedText
    );

    const languageCode = languageNameToCode(translationState.targetLanguage);
    if (!languageCode) return;

    utterance.lang = languageCode;
    speechSynthesis.speak(utterance);
  };

  //cancel speech synthesis when component unmounts, i.e when the translation changes
  React.useEffect(() => {
    return () => {
      speechSynthesis.cancel();
    };
  }, []);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={speakOut}
          aria-label="speak out translation"
          className="w-fit diabled:bg-yellow-500"
        >
          <Volume2
            size={32}
            className="stroke-primary-blue cursor-pointer hover:bg-slate-100 rounded-full p-1"
            aria-hidden
          />
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Speak out translation</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default SpeechSynthesis;
