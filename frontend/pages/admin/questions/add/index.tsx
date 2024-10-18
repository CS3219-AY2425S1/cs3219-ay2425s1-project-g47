import { useRouter } from "next/router";
import { useState } from "react";

import DefaultLayout from "@/layouts/default";
import QuestionForm from "@/components/forms/QuestionForm";
import { Question } from "@/types/questions";
import { useAddQuestions } from "@/hooks/api/questions";

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

  const { mutate: addQuestion, isError, error } = useAddQuestions();

  const handleOnSubmit = (updatedData: Question) => {
    addQuestion(
      { ...updatedData },
      {
        onSuccess: () => {
          alert("Question successfully added!");
          router.push("/admin/questions"); // Redirect to admin questions list on success
        },
      },
    );
  };

  return (
    <DefaultLayout isLoggedIn={true}>
      <div className="flex items-center justify-center">
        <div className="w-full max-w-4xl p-4 border-solid border-2 rounded-lg">
          <QuestionForm
            formData={formData}
            formType="Add"
            setFormData={setFormData}
            onSubmit={handleOnSubmit}
          />

          {isError && (
            <p className="text-red-500 mt-4 text-center">{`${error?.message}. Please try again later.`}</p>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default AddQuestionsPage;
