import mongoose, { Document, Schema } from "mongoose";

export interface ITranslation extends Document {
  timestamp: Date;
  from: string;
  to: string;
  fromText: string;
  toText: string;
}

export interface IUser extends Document {
  userId: string;
  translations: Array<ITranslation>;
}

const translationSchema = new Schema<ITranslation>({
  timestamp: { type: Date, default: Date.now },
  from: String,
  to: String,
  fromText: String,
  toText: String,
});

const userSchema = new Schema<IUser>({
  userId: String,
  translations: [translationSchema],
});

//check if the model is already created to prevent OverwriteModelError
export const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);