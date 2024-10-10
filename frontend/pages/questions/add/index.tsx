import { useRouter } from "next/router";
import { useState } from "react";

import DefaultLayout from "@/layouts/default";
import QuestionForm from "@/components/forms/QuestionForm";
import { Question } from "@/types/questions";
import { useAddQuestions } from "@/hooks/questions";

const AddQuestionsPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<Question>({
    title: "",
    complexity: "",
    category: [],
    description: "",
    examples: "",
    constraints: "",
  });

  const { mutate: addQuestion } = useAddQuestions();

  const handleOnSubmit = (updatedData: Question) => {
    addQuestion(
      { ...updatedData },
      {
        onSuccess: () => {
          alert("Question successfully added!");
          router.push("/questions"); // Redirect to questions list on success
        },
        onError: (error) => {
          if (error.response) {
            alert(`Error adding the question: ${error.response.data}`);
          } else {
            alert(`Error adding the question: ${error.message}`);
          }
        },
      },
    );
  };

  return (
    <DefaultLayout>
      <div className="flex items-center justify-center">
        <div className="w-full max-w-4xl p-4 border-solid border-2 rounded-lg">
          <QuestionForm
            formData={formData}
            formType="Add"
            setFormData={setFormData}
            onSubmit={handleOnSubmit}
          />
        </div>
      </div>
    </DefaultLayout>
  );
};

export default AddQuestionsPage;
