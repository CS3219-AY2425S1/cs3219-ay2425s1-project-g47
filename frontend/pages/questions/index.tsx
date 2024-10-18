import { useState } from "react";

import { useQuestions } from "@/hooks/api/questions";
import QuestionTable from "@/components/questions/QuestionTable";
import DefaultLayout from "@/layouts/default";

const UserQuestionsPage = () => {
  const [pageNumber, setPageNumber] = useState<number>(1);
  const { data: questionList, isLoading, isError } = useQuestions(pageNumber);
  const handleOnPageClick = (page: number) => {
    setPageNumber(page);
  };

  return (
    <>
      <DefaultLayout isLoggedIn={true}>
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
      </DefaultLayout>
    </>
  );
};

export default UserQuestionsPage;
