import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Divider } from "@nextui-org/divider";

import NavLink from "../navLink";

import CategoryTags from "./CategoryTags";
import DifficultyTags from "./DifficultyTags";

import { Question } from "@/types/questions";
interface QuestionDescriptionProps {
  question: Question;
  index: string;
}

export default function QuestionDescription({
  question,
  index,
}: QuestionDescriptionProps) {
  const { questionId, title, complexity, category, description } = question;

  return (
    <Card className="p-5 m-8">
      <CardHeader>
        <div>
          <h2 className="font-bold italic border-b-2 mb-2">{`${index}: ${title}`}</h2>
          <DifficultyTags difficulty={complexity} />
        </div>
      </CardHeader>
      <Divider />
      <CardBody>
        <CategoryTags categories={category} questionId={questionId as string} />
        <p className="my-3">Question:</p>
        <pre className="bg-gray-700 p-2 rounded-lg ">
          <code className="text-white text-pretty">{description}</code>
        </pre>
      </CardBody>
      <CardFooter>
        <NavLink hover={true} href="/questions">
          Back to questions
        </NavLink>
      </CardFooter>
    </Card>
  );
}
