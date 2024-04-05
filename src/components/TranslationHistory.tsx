import React from "react";
import { IUser } from "../mongodb/models/User";
import { auth } from "@clerk/nextjs/server";
import { MoveRight, Calendar } from "lucide-react";
import DeleteTranslation from "./DeleteTranslation";

export async function TranslationHistory() {
  const { userId } = auth();

  if (!userId) return null;

  const url =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3001"
      : process.env.PRODUCTION_URL;

  const res = await fetch(`${url}/api/translation-history?userId=${userId}`, {
    next: { tags: ["translation-history"] },
  });
  const translations = (await res.json()) as IUser["translations"];

  const sortedTranslations = translations.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <section aria-label="saved translations">
      <h2 className="md:text-center text-lg text-primary-blue font-medium my-8">
        Saved Translations
      </h2>
      {sortedTranslations.length === 0 && (
        <p className="md:text-center font-medium">No translations saved yet.</p>
      )}
      {sortedTranslations.length > 0 && (
        <ul className="flex flex-col gap-4">
          {sortedTranslations.map((translation, index) => (
            <li
              key={index}
              className="border border-slate-200 rounded-lg p-6 flex flex-col gap-2"
            >
              <div className="flex justify-between">
                <p className="flex items-center gap-2 text-slate-500 font-bold">
                  {translation.from} <MoveRight strokeWidth={1} />
                  {translation.to}
                </p>
                <span className="flex gap-2 items-center">
                  <Calendar strokeWidth={1} size={16} />
                  {new Date(translation.timestamp)!.toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <div>
                  <p className="mb-2">{translation.fromText}</p>
                  <p className="italic">{translation.toText}</p>
                </div>
                <DeleteTranslation translationId={translation._id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default TranslationHistory;
