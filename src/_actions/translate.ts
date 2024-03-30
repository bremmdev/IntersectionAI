"use server";

export type TranslateSuccessResponse = Array<{
  translations: Array<{
    text: string;
    to: string;
  }>;
}>;

export type DetectSuccessResponse = Array<{
  isTranslationSupported: boolean;
  isTransliterationSupported: boolean;
  language: string;
  score: number;
}>;

export type ErrorResponse = {
  error: {
    code: number;
    message: string;
  };
};

export type TranslateResponse = TranslateSuccessResponse | ErrorResponse;
export type DetectResponse = DetectSuccessResponse | ErrorResponse;

import { auth } from "@clerk/nextjs/server";

const languageToFullCode = (name: string) => {
  if (name === "Dutch") return "nl-NL";
  if (name === "German") return "de-DE";
  if (name === "English") return "en-US";
  return "invalid language";
};

function withAuth(fn: Function) {
  return async function (...args: any[]) {
    const { userId } = auth();
    if (!userId) throw new Error("User not authenticated");
    return await fn(...args);
  };
}

export const detectLanguage = withAuth(async (text: string) => {
  const detectEndpoint = `${process.env.AZURE_TRANSLATE_ENDPOINT}detect?api-version=3.0`;

  const response = await fetch(detectEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": process.env.AZURE_TRANSLATE_KEY as string,
      "Ocp-Apim-Subscription-Region": process.env
        .AZURE_TRANSLATE_REGION as string,
    },
    body: JSON.stringify([{ Text: text }]),
  });

  const data = (await response.json()) as DetectResponse;

  return data;
});

export const translateText = withAuth(
  async (text: string, to: string, from?: string) => {
    const translateEndpoint = `${
      process.env.AZURE_TRANSLATE_ENDPOINT
    }translate?api-version=3.0${from ? `&from=${from}` : ""}&to=${to}`;

    const response = await fetch(translateEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": process.env.AZURE_TRANSLATE_KEY as string,
        "Ocp-Apim-Subscription-Region": process.env
          .AZURE_TRANSLATE_REGION as string,
      },
      body: JSON.stringify([{ Text: text }]),
    });

    const data = (await response.json()) as TranslateResponse;

    return data;
  }
);

export const transcribe = withAuth(async (formData: FormData) => {
  const endpoint = process.env.SPEECH_ENDPOINT as string;

  const selectedLanguage = formData.get("language") as string;

  //get the audio file from the form data
  const audioFile = formData.get("audio") as File;

  const arrayBuffer = await audioFile.arrayBuffer();
  const audio = new Uint8Array(arrayBuffer);

  const response = await fetch(
    endpoint + `?language=${languageToFullCode(selectedLanguage)}`,
    {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": process.env.SPEECH_KEY as string,
        "Ocp-Apim-Subscription-Region": process.env.SPEECH_REGION as string,
        "Content-Type": "audio/wav; codecs=audio/pcm; samplerate=16000",
        Accept: "application/json",
      },
      body: audio,
    }
  );
  const data = await response.json();
  return data;
});
