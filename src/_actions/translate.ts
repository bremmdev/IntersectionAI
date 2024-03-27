"use server";

export async function detectLanguage(text: string) {
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

  const data = await response.json();

  return data;
}

export async function translateText(text: string, to: string, from?: string) {
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

  const data = await response.json();

  return data;
}
