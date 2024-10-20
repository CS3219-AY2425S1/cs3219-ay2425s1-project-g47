export interface Question {
  questionId?: string; // Unique identifier for the question
  title: string; // Title or main prompt of the question
  complexity: string; // Complexity level (e.g., easy, medium, hard)
  category: string[]; // Category or topic to which the question belongs
  description: string; // Detailed description of the question
  examples: string;
  constraints: string;
  index?: number;
}

export interface QuestionList {
  questions: Question[];
  totalPages: string;
}
