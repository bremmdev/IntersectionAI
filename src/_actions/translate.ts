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

import { checkRateLimit } from "@/lib/limit";
import { auth } from "@clerk/nextjs/server";

const languageToFullCode = (name: string) => {
  if (name === "nl") return "nl-NL";
  if (name === "de") return "de-DE";
  if (name === "en") return "en-US";
  return "invalid language";
};

//withAuth function to check if the user is authenticated
//and pass the userId to the function, needed for rate limiting in translateText
function withAuth(fn: Function) {
  return async function (...args: any[]) {
    const { userId } = auth();
    if (!userId) throw new Error("User not authenticated");
    return await fn(userId, ...args);
  };
}

export const detectLanguage = withAuth(async (userId: string, text: string) => {
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
  async (userId: string, text: string, to: string, from?: string) => {
    //rate limit logic here
    const exceeded = await checkRateLimit(userId);

    if (exceeded) {
      return {
        error: {
          message: "Rate limit exceeded",
          limitExceeded: true,
        },
      };
    }

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

export const transcribe = withAuth(
  async (userId: string, formData: FormData) => {
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
  }
);
