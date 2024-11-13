import { Schema, model } from "mongoose";


// Interface for Question document
export interface Question {
  questionId: string;
  title: string;
  description: string;
  constraints: string;
  examples: string;
  category: string[];
  complexity: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Match {
  userOne: string;
  userTwo: string;
  room_id: string;
  programming_language: string;
  complexity: string[];
  categories: string[];
  question: Question; // Single Question object
  status: string;
  createdAt: Date
}

// Mongoose schema for the Question model
export const questionSchema = new Schema<Question>({
  questionId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: false },
  constraints: { type: String, required: false },
  examples: { type: String, required: false },
  category: [{ type: String, required: false }],
  complexity: { type: String, required: false },
  imageUrl: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Mongoose schema for the Match model, embedding a single Question
const matchSchema = new Schema<Match>({
  userOne: { type: String, required: true },
  userTwo: { type: String, required: true },
  room_id: { type: String, required: true },
  complexity: { type: [String], required: true },
  categories: { type: [String], required: true },
  programming_language: {type: String, required: true},
  question: { type: questionSchema, required: true }, // Embedded single Question document
  status: {type: String, required:true},
  createdAt: { type: Date, default: Date.now },
});

// Create models from schemas
export const QuestionModel = model<Question>("Question", questionSchema);
export const MatchModel = model<Match>("Match", matchSchema);

