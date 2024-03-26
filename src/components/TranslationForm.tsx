"use client";

import React from "react";
import { Textarea } from "./ui/textarea";
import LanguageSelector from "./LanguageSelector";

const TranslationForm = () => {
  return (
    <div className="">
      <form className="flex flex-col gap-4">
        <LanguageSelector />
        <Textarea />
      </form>
    </div>
  );
};

export default TranslationForm;
