import { Schema, model, Document } from 'mongoose';

export interface UserDocument extends Document {
  email: string;
  password: string;
}

const UserSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const UserModel = model<UserDocument>('User', UserSchema);
