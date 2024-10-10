import React, { useCallback } from "react";
import { Key as ReactKey } from "react";
import Link from "next/link";
import { Button } from "@nextui-org/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@nextui-org/table";
import { Pagination } from "@nextui-org/pagination";

import NavLink from "@/components/navLink";
import CategoryTags from "@/components/questions/CategoryTags";
import DifficultyTags from "@/components/questions/DifficultyTags";
import ActionButtons from "@/components/questions/ActionButtons";
import { Question } from "@/types/questions";

interface QuestionTableProps {
  questions: Question[];
  totalPages: number;
  pageNumber: number;
  handlePageOnClick: (page: number) => void;
}

const columns = [
  { name: "No.", uid: "index" },
  { name: "Title", uid: "title" },
  { name: "Category", uid: "category" },
  { name: "Difficulty", uid: "complexity" },
  { name: "Action", uid: "action" },
];

const QuestionTable: React.FC<QuestionTableProps> = ({
  questions,
  totalPages,
  pageNumber,
  handlePageOnClick,
}) => {
  questions = questions.map((question, idx) => ({
    ...question,
    index: idx + 1,
  }));
  const renderCell = useCallback((question: Question, columnKey: ReactKey) => {
    const questionValue = question[columnKey as keyof Question];

    switch (columnKey) {
      case "index": {
        return (
          <NavLink
            hover={true}
            href={`/questions/question-description?id=${question.questionId}&index=${question.index}`}
          >
            {questionValue}
          </NavLink>
        );
      }
      case "title": {
        const titleString: string = questionValue as string;

        return <h2 className="capitalize">{titleString}</h2>;
      }
      case "category": {
        const categories: string[] = questionValue as string[];

        return (
          <CategoryTags
            categories={categories}
            questionId={question.questionId || ""}
          />
        );
      }
      case "complexity": {
        return <DifficultyTags difficulty={questionValue as string} />;
      }
      case "action": {
        return <ActionButtons question={question} />;
      }
      default: {
        return <h2>{questionValue}</h2>;
      }
    }
  }, []);

  return (
    <div className="flex flex-col items-center w-10/12">
      <div className="flex w-full justify-between">
        <h2>Questions</h2>
        <Button as={Link} href="/questions/add">
          Add
        </Button>
      </div>
      <div className="mt-5 h-52 w-full">
        <Table
          aria-label="Question Table"
          bottomContent={
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                showControls
                showShadow
                color="secondary"
                loop={true}
                page={pageNumber}
                total={totalPages}
                onChange={handlePageOnClick}
              />
            </div>
          }
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn
                key={column.uid}
                align={column.uid === "action" ? "center" : "start"}
              >
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody emptyContent={"No questions to display"} items={questions}>
            {(item) => (
              <TableRow key={item.questionId}>
                {(columnKey) => (
                  <TableCell>{renderCell(item, columnKey)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default QuestionTable;
