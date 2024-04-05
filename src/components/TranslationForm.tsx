"use client";

import React from "react";
import { Textarea } from "./ui/textarea";
import LanguageSelector from "./LanguageSelector";
import { useDebounce } from "@/hooks/useDebounce";
import { detectLanguage } from "@/_actions/translate";
import { useTranslation } from "@/context/translation-context";
import {
  availableLanguages,
  availableTargetLanguages,
} from "@/context/translation-context";
import {
  LanguageName,
} from "@/context/translation-context";
import { translateText } from "@/_actions/translate";
import { codeToLanguageName, sanitizeLanguage, sanitizeTargetLanguage } from "@/lib/utils";
import TargetLanguageSelector from "./TargetLanguageSelector";
import TranslationText from "./TranslationText";
import SpeechRecorder from "./SpeechRecorder";
import { X as DeleteTextIcon } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

const TranslationForm = () => {
  const textAreaRef = React.useRef<HTMLTextAreaElement>(null);
  const [translationState, translationDispatch] = useTranslation();

  const searchParams = useSearchParams();
  const textParam = searchParams.get("text") || "";
  const selectedLanguage = sanitizeLanguage(searchParams.get("from"))
  const targetLanguage = sanitizeTargetLanguage(searchParams.get("to"))

  const router = useRouter();

  const { input, recordingStatus } = translationState;

  const debouncedInput = useDebounce(input, 200);

  const translateInput = React.useCallback(
    async (
      debouncedInput: string,
      targetLanguage: string,
      fromLanguageCode?: string
    ) => {
      translationDispatch({ type: "TRANSLATION_START" });

      const translatedData = await translateText(
        debouncedInput,
        targetLanguage,
        fromLanguageCode
      );

      translationDispatch({
        type: "TRANSLATION_DONE",
        payload: translatedData,
      });
    },
    [translationDispatch]
  );

  const detectLanguageAndTranslate = React.useCallback(async () => {
    const data = await detectLanguage(debouncedInput);

    //don't translate on detection error, rate limit errors are handled by the translate function
    if ("error" in data && !data.error.limitExceeded) {
      translationDispatch({
        type: "DETECTION_ERROR",
        payload: data.error.message,
      });
      return;
    }

    //only support English, Dutch and German
    const supportedLanguages = availableTargetLanguages.map(
      (language) => language.code
    ) as string[];
    const detectedLanguageByService = data[0]?.language;
    if (!supportedLanguages.includes(detectedLanguageByService)) {
      translationDispatch({
        type: "DETECTION_ERROR",
        payload: {
          message: `Detected language '${detectedLanguageByService}' is not supported. Please try again.`,
        },
      });
      return;
    }

    //no error and supported language, so translate

    //set detected language only if it is one of the available languages
    const availableLanguageCode = availableLanguages.map((lang) => lang.code);
    if (availableLanguageCode.includes(data[0].language)) {
      const detectedLanguage = codeToLanguageName(data[0].language);

      translateInput(debouncedInput, targetLanguage);

      translationDispatch({
        type: "DETECTED_LANGUAGE_CHANGE",
        payload: detectedLanguage as LanguageName,
      });
    } else {
      translationDispatch({
        type: "DETECTED_LANGUAGE_CHANGE",
        payload: "auto",
      });
    }
  }, [
    debouncedInput,
    targetLanguage,
    translateInput,
    translationDispatch,
  ]);

  //when 'detect language' is selected, we want to detect the language and translate
  React.useEffect(() => {
    if (debouncedInput && selectedLanguage === "auto") {
      detectLanguageAndTranslate();
    }
  }, [
    debouncedInput,
    selectedLanguage,
    targetLanguage,
    detectLanguageAndTranslate,
  ]);

  //when a language is selected, we want to translate the input
  React.useEffect(() => {
    if (debouncedInput && selectedLanguage !== "auto") {
   
        translateInput(debouncedInput, targetLanguage, selectedLanguage);
      
    }
  }, [debouncedInput, selectedLanguage, targetLanguage, translateInput]);

  // update url with text after debouncing
  React.useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams);

    if (debouncedInput === "") {
      newSearchParams.delete("text");
      router.push("?" + newSearchParams.toString())
      return;
    }

    // Only update if values have changed
    if (textParam !== debouncedInput && debouncedInput !== "") {
      newSearchParams.set("text", debouncedInput);
      router.push("?" + newSearchParams.toString());
    }
  }, [debouncedInput, searchParams, translationDispatch, textParam, router]);

  // set initial state from url
  React.useEffect(() => {
    if (textParam) {
      translationDispatch({
        type: "INPUT_CHANGE",
        payload: textParam,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value === "") {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set("text", "");
      router.push("?" + newSearchParams.toString());
      translationDispatch({ type: "INPUT_CLEAR" });
      return;
    }

    translationDispatch({ type: "INPUT_CHANGE", payload: e.target.value });
  };

  const handleClearInput = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("text", "");
    router.push("?" + newSearchParams.toString());
    translationDispatch({ type: "INPUT_CLEAR" });
    textAreaRef.current?.focus();
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-8">
      <div className="basis-1/2">
        <div className="flex flex-col gap-4">
          <h2 className="text-lg text-primary-blue font-medium">
            Translate from
          </h2>
          <LanguageSelector />
          <div className="textarea-wrapper relative border border-input rounded-lg">
            {translationState.recordingStatus === "stopped" && (
              <span className="translation-loader absolute z-10 top-2 left-4 text-slate-600">
                Translating speech...
              </span>
            )}
            <Textarea
              aria-label="input text to translate"
              name="input"
              className="relative min-h-40 focus-visible:outline-none focus:outline-none disabled:cursor-not-allowed pr-10"
              autoFocus
              ref={textAreaRef}
              value={input}
              disabled={
                recordingStatus === "recording" || recordingStatus === "stopped"
              }
              onChange={handleTextChange}
            />
            {input.length > 0 && (
              <button
                className="absolute top-1 right-4"
                onClick={handleClearInput}
                aria-label="clear input text"
              >
                <DeleteTextIcon
                  size={32}
                  className="stroke-slate-600 cursor-pointer hover:bg-slate-100 rounded-full p-1"
                  aria-hidden
                />
              </button>
            )}
          </div>
          <SpeechRecorder />
        </div>
      </div>
      <div className="basis-1/2 flex flex-col gap-4">
        <h2 className="text-lg text-primary-blue font-medium">Translate to</h2>
        <TargetLanguageSelector />
        <TranslationText />
      </div>
    </div>
  );
};

export default TranslationForm;
