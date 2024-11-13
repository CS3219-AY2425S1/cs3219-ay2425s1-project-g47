import { Schema, model } from "mongoose";
import { Question, questionSchema } from "./match"; // Import questionSchema from the Question file

// Interface for Session document
export interface Session {
  userOne: string;
  userTwo: string;
  room_id: string;
  code: string;
  programming_language: string;
  question: Question; // Embedded Question object
  createdAt: Date;
}

// Mongoose schema for the Session model, embedding a single Question
const sessionSchema = new Schema<Session>({
  userOne: { type: String, required: true },
  userTwo: { type: String, required: true },
  room_id: { type: String, required: true, unique: true },
  code: { type: String },
  programming_language: { type: String, required: true },
  question: { type: questionSchema, required: true }, // Embedded single Question document
  createdAt: { type: Date, default: Date.now },
});

// Create the Session model from the schema
export const SessionModel = model<Session>("Session", sessionSchema);
