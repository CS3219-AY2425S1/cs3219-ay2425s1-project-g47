"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { useGetQuestion } from "@/hooks/api/questions";
import QuestionDescription from "@/components/questions/QuestionDescription";

function QuestionContent() {
  const searchParams = useSearchParams();
  const questionId = searchParams?.get("id");
  const idString: string = (
    Array.isArray(questionId) ? questionId[0] : questionId
  ) as string;
  const { data: question, isLoading, isError } = useGetQuestion(idString);

  return isLoading ? (
    <h1>fetching question</h1>
  ) : isError || !question ? (
    <p>Error fetching Question</p>
  ) : (
    <QuestionDescription isCollab={false} question={question} />
  );
}

export default function Page() {
  return (
    <Suspense fallback={<h1>Loading question...</h1>}>
      <QuestionContent />
    </Suspense>
  );
}
