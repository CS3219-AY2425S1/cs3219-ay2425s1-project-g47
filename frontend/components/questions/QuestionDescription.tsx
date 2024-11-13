import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Divider } from "@nextui-org/divider";
import { useTheme } from "next-themes";

import NavLink from "@/components/navLink";
import CategoryTags from "@/components/questions/CategoryTags";
import DifficultyTags from "@/components/questions/DifficultyTags";
import { Question } from "@/types/questions";

interface QuestionDescriptionProps {
  question: Question;
  isCollab: boolean;
}

export default function QuestionDescription({
  question,
  isCollab,
}: QuestionDescriptionProps) {
  const {
    questionId,
    title,
    complexity,
    category,
    description,
    examples,
    constraints,
  } = question;
  const { theme } = useTheme();

  let descriptionBgColor: string;
  let textColor: string;

  if (theme === "dark") {
    descriptionBgColor = "bg-gray-600 bg-opacity-70";
    textColor = "text-white";
  } else {
    descriptionBgColor = "bg-gray-300 bg-opacity-70";
    textColor = "text-black";
  }

  return (
    <Card className="p-3 m-3">
      <CardHeader className="flex flex-col items-start">
        <h2 className="font-bold text-2xl mb-4">{`${title}`}</h2>
        <div className="flex mb-4 text-med">
          Complexity:&nbsp; <DifficultyTags difficulty={complexity} />
        </div>
        <div className="mb-4 text-sm">
          <CategoryTags
            categories={category}
            questionId={questionId as string}
          />
        </div>
      </CardHeader>
      <Divider />
      <CardBody>
        <p className="my-3 text-lg">Description</p>
        <div className="max-h-[200px] overflow-y-auto">
          <pre
            className={
              descriptionBgColor + " p-2 rounded-lg text-balance min-h-[100px]"
            }
          >
            <code className={textColor + " text-pretty min-h-[50px]"}>
              {description}
            </code>
          </pre>
        </div>
        <p className="my-3 text-lg">Examples</p>
        <div className="max-h-[150px] overflow-y-auto">
          <pre
            className={
              descriptionBgColor + " p-2 rounded-lg text-balance min-h-[50px]"
            }
          >
            <code className={textColor + " text-pretty"}>
              {examples || "There are no examples."}
            </code>
          </pre>
        </div>
        <p className="my-3 text-lg">Constraints</p>
        <div className="max-h-[150px] overflow-y-auto">
          <pre
            className={
              descriptionBgColor + " p-2 rounded-lg text-balance min-h-[50px]"
            }
          >
            <code className={textColor + " text-pretty min-h-[50px]"}>
              {constraints || "There are no constraints."}
            </code>
          </pre>
        </div>
      </CardBody>
      {!isCollab && (
        <CardFooter>
          <NavLink hover={true} href="/questions">
            Back to questions
          </NavLink>
        </CardFooter>
      )}
    </Card>
  );
}
