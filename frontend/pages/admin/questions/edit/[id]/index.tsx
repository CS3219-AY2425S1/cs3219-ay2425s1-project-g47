import { useRouter } from "next/router";
import { useState, useEffect } from "react";

import DefaultLayout from "@/layouts/default";
import QuestionForm from "@/components/forms/QuestionForm";
import { useGetQuestion } from "@/hooks/api/questions";
import { useUpdateQuestions } from "@/hooks/api/questions";
import { Question } from "@/types/questions";

const EditQuestionsPage = () => {
  const router = useRouter();
  // Extract questionId from the query parameters
  const { id } = router.query;

  // Fetch the question using useGetQuestion hook
  const { data: question, isLoading, error } = useGetQuestion(id as string);

  const [formData, setFormData] = useState<Question>({
    title: "",
    complexity: "",
    category: [],
    description: "",
    examples: "",
    constraints: "",
  });

  // Update formData when question is fetched
  useEffect(() => {
    if (question) {
      setFormData({
        title: question.title || "",
        complexity: question.complexity || "",
        category: question.category || [],
        description: question.description || "",
        examples: question.examples || "",
        constraints: question.constraints || "",
      });
    }
  }, [question]);

  // Mutation hook to update the question
  const {
    mutate: updateQuestion,
    isError: isUpdateError,
    error: updateError,
  } = useUpdateQuestions();

  // Handle the form submission for updating the question
  const handleOnSubmit = (updatedData: Question) => {
    updateQuestion(
      { ...updatedData, questionId: id as string }, // Pass the updated question with ID
      {
        onSuccess: () => {
          alert("Question successfully updated!");
          router.push("/admin/questions"); // Redirect to questions list on success
        },
      },
    );
  };

  return (
    <DefaultLayout isLoggedIn={true}>
      <div className="flex items-center justify-center">
        <div className="w-full max-w-4xl p-4 border-solid border-2 rounded-lg">
          {isLoading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>Error loading question. Please try again later.</p>
          ) : !question ? (
            <p>Question does not exist!</p>
          ) : (
            <>
              <QuestionForm
                formData={formData}
                formType="Edit"
                setFormData={setFormData}
                onSubmit={handleOnSubmit}
              />
              {isUpdateError && (
                <p className="text-red-500 mt-4 text-center">{`${updateError?.message}. Please try again later.`}</p>
              )}
            </>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default EditQuestionsPage;
