"use client";

import { useState } from "react";

import { useQuestions } from "@/hooks/api/questions";
import QuestionTable from "@/components/questions/QuestionTable";

export default function Page() {
  const [pageNumber, setPageNumber] = useState<number>(1);
  const { data: questionList, isLoading, isError } = useQuestions(pageNumber);
  const handleOnPageClick = (page: number) => {
    setPageNumber(page);
  };

  return (
    <>
      {isLoading ? (
        <p>Fetching Questions...</p>
      ) : isError ? (
        <p>Had Trouble Fetching Questions!</p>
      ) : (
        <div className="flex justify-center">
          <QuestionTable
            handlePageOnClick={handleOnPageClick}
            isAdmin={false}
            pageNumber={pageNumber}
            questions={questionList?.questions || []}
            totalPages={parseInt(questionList?.totalPages || "1")}
          />
        </div>
      )}
    </>
  );
}
