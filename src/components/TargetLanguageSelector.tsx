import React from "react";

import { Tabs } from "./ui/Tabs";
import { useTranslation } from "@/context/translation-context";
import type {
  LanguageName, TargetLanguageName,
} from "@/context/translation-context";
import { languagesWithoutDetect } from "@/lib/utils";

const TargetLanguageSelector = () => {
  const [translationState, translationDispatch] = useTranslation();

  const { targetLanguage } = translationState;

  const languages = React.useMemo(() => languagesWithoutDetect(), []);

  const handleLanguageChange = (value: string) => {
    translationDispatch({
      type: "TARGET_LANGUAGE_CHANGE",
      payload: value as TargetLanguageName,
    });
  };

  return (
    <div>
      <Tabs.Root
        value={targetLanguage as LanguageName}
        onValueChange={handleLanguageChange}
      >
        <Tabs.List aria-label="target language selector">
          {languages.map((lang) => {
            return (
              <Tabs.Tab key={lang.code} label={lang.name}>
                {lang.name}
              </Tabs.Tab>
            );
          })}
        </Tabs.List>
        <></>
      </Tabs.Root>
    </div>
  );
};

export default TargetLanguageSelector;
