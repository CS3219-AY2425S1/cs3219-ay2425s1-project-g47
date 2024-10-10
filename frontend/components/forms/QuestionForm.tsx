"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { Input, Textarea } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { Select, SelectItem } from "@nextui-org/select";

import { Question } from "@/types/questions";
import { getAllQuestionCategories } from "@/utils/questions";

interface QuestionFormProps {
  formType: string;
  formData: Question;
  setFormData: (formData: Question) => void;
  onSubmit: (data: Question) => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({
  formType,
  formData,
  setFormData,
  onSubmit,
}) => {
  const router = useRouter();
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  const allCategories = getAllQuestionCategories();

  const handleTitleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      title: e.target.value,
    });
  };

  const handleComplexityOnChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setFormData({
      ...formData,
      complexity: e.target.value,
    });
  };

  const handleCategoryOnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      category: e.target.value.split(","),
    });
  };

  const handleDescriptionOnChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setFormData({
      ...formData,
      description: e.target.value,
    });
  };

  const handleExamplesOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      examples: e.target.value,
    });
  };

  const handleConstraintsOnChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setFormData({
      ...formData,
      constraints: e.target.value,
    });
  };

  const isValid = () => {
    const newErrors: { [key: string]: boolean } = {};

    if (!formData.title) {
      newErrors.title = true;
    }

    if (!formData.complexity) {
      newErrors.complexity = true;
    }

    if (formData.category.length === 0) {
      newErrors.category = true;
    }

    if (!formData.description) {
      newErrors.description = true;
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!isValid()) {
      return;
    }

    onSubmit(formData);
  };

  return (
    <>
      <h2 className="text-4xl font-bold mb-4">{formType} Question</h2>
      <div className="flex mb-4">
        <p className="basis-1/4 self-end">Question Title</p>
        <Input
          errorMessage="Please input a question title."
          isInvalid={!!errors.title}
          isRequired={true}
          label="Input Question Title"
          value={formData.title}
          variant="underlined"
          onChange={handleTitleOnChange}
        />
      </div>
      <div className="flex mb-4">
        <p className="basis-1/4 self-end">Question Complexity</p>
        <Select
          errorMessage="Please select the question complexity."
          isInvalid={!!errors.complexity}
          isRequired={true}
          label="Select Difficulty"
          selectedKeys={[formData.complexity]}
          variant="underlined"
          onChange={handleComplexityOnChange}
        >
          <SelectItem key="Easy">Easy</SelectItem>
          <SelectItem key="Medium">Medium</SelectItem>
          <SelectItem key="Hard">Hard</SelectItem>
        </Select>
      </div>
      <div className="flex mb-4">
        <p className="basis-1/4 self-end">Question Category</p>
        <Select
          errorMessage="Please select a category."
          isInvalid={!!errors.category}
          isRequired={true}
          label="Select Topics"
          selectedKeys={formData.category}
          selectionMode="multiple"
          variant="underlined"
          onChange={handleCategoryOnChange}
        >
          {allCategories.map((topic) => (
            <SelectItem key={topic}>{topic}</SelectItem>
          ))}
        </Select>
      </div>
      <div className="flex mb-2">
        <Textarea
          errorMessage="Please provide the question description."
          isInvalid={!!errors.description}
          isRequired={true}
          label="Input Question Description"
          minRows={4}
          value={formData.description}
          onChange={handleDescriptionOnChange}
        />
      </div>
      <div className="flex mb-4">
        <Textarea
          label="[Optional] Input Question Examples."
          minRows={2}
          value={formData.examples}
          onChange={handleExamplesOnChange}
        />
      </div>
      <div className="flex mb-4">
        <Textarea
          label="[Optional] Input Question Constraints."
          minRows={2}
          value={formData.constraints}
          onChange={handleConstraintsOnChange}
        />
      </div>
      <div className="flex justify-end space-x-4">
        <Button color="danger" onClick={() => router.push("/questions")}>
          Cancel
        </Button>
        <Button color="primary" onClick={handleSubmit}>
          {formType}
        </Button>
      </div>
    </>
  );
};

export default QuestionForm;
