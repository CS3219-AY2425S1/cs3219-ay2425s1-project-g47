// Requests to API endpoints for questions
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

import axios from "@/utils/axios";
import { Question, QuestionList } from "@/types/questions";

const fetchQuestionFromPage = async (page: number) => {
  const { data } = await axios.get(`/questions?page=${page}&limit=10`);
  return data;
}
// Fetch questions list
export const useQuestions = (page: number) => {
  return useQuery<QuestionList, Error>({
    queryKey: ["questions", page],
    queryFn: () => fetchQuestionFromPage(page), // Corrected syntax
  });
};


// Fetch a single question
export const useGetQuestion = (id: string) => {
  return useQuery<Question, Error>({
    queryKey: ["question", id],
    queryFn: async () => {
      const response = await axios.get(`/questions/${id}`);

      return response.data;
    },
    enabled: !!id, // Only fetch if id is available
  });
};

// Add a new questions
export const useAddQuestions = () => {
  const queryClient = useQueryClient();

  return useMutation<Question, AxiosError, Question>({
    mutationFn: async (question: Question) => {
      return axios.post("/questions", question);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
  });
};

// Update a question
export const useUpdateQuestions = () => {
  const queryClient = useQueryClient();

  return useMutation<Question, AxiosError, Question>({
    mutationFn: async (question: Question) => {
      return axios.put(`/questions/${question.questionId}`, question);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
  });
};

// Delete a question
export const useDeleteQuestions = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (questionId: string) => {
      return axios.delete(`/questions/${questionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
  });
};
