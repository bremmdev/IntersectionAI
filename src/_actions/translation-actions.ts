"use server";
import { connectDB } from "@/mongodb/db";
import { User } from "../mongodb/models/User";
import { revalidateTag } from "next/cache";
import { auth } from "@clerk/nextjs/server";

export async function saveTranslation(translation: {
  from: string;
  to: string;
  fromText: string;
  toText: string;
}) {
  const { userId } = auth();

  if (!userId) {
    return {
      error: "User not authenticated",
    };
  }

  await connectDB();
  //if the user exists, add the translation using upsert, otherwise create the user and add the translation
  try {
    await User.findOneAndUpdate(
      { userId },
      { $push: { translations: translation } },
      { upsert: true, new: true }
    );
    revalidateTag("translation-history");
  } catch (error) {
    return {
      error: "Could not save translation",
    };
  }
}

export async function deleteTranslation(translationId: string) {
  const { userId } = auth();

  if (!userId) {
    return {
      error: "User not authenticated",
    };
  }
  await connectDB();

  try {
    await User.findOneAndUpdate(
      { userId },
      { $pull: { translations: { _id: translationId } } }
    );
    revalidateTag("translation-history");
  } catch (error) {
    return {
      error: "Could not delete translation",
    };
  }
}
