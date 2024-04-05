import React from "react";

import { Tabs } from "./ui/Tabs";
import {
  languagesWithoutDetect,
  languageNameToCode,
  codeToLanguageName,
} from "@/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";
import { sanitizeTargetLanguage } from "@/lib/utils";

const TargetLanguageSelector = () => {
  const searchParams = useSearchParams();

  const targetLanguage = sanitizeTargetLanguage(searchParams.get("to"));

  const router = useRouter();

  const languages = React.useMemo(() => languagesWithoutDetect(), []);

  const handleLanguageChange = (value: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("to", languageNameToCode(value) || "en");
    router.push("?" + newSearchParams.toString());
  };

  return (
    <div>
      <Tabs.Root
        value={codeToLanguageName(targetLanguage)}
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
