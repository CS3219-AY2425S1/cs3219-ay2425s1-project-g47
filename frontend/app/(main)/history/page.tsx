"use client";

import { useState } from "react";

import { useHistory } from "@/hooks/api/history";
import HistoryTable from "@/components/history/HistoryTable";
import { useUser } from "@/hooks/users";

export default function Page() {
  const [pageNumber, setPageNumber] = useState<number>(1);
  const { user } = useUser();
  const {
    data: historyList,
    isLoading,
    isError,
  } = useHistory(user?.username || "", pageNumber);
  const handleOnPageClick = (page: number) => {
    setPageNumber(page);
  };

  return (
    <>
      {isLoading ? (
        <p>Fetching History...</p>
      ) : isError ? (
        <p>Had Trouble Fetching History!</p>
      ) : (
        <div className="flex justify-center">
          <HistoryTable
            handlePageOnClick={handleOnPageClick}
            pageNumber={pageNumber}
            sessions={historyList?.sessions || []}
            totalPages={parseInt(historyList?.totalPages || "1")}
            totalSessions={parseInt(historyList?.totalSessions || "")}
            username={user?.username || ""}
          />
        </div>
      )}
    </>
  );
}
