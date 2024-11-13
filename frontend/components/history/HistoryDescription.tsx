import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Divider } from "@nextui-org/divider";
import { useTheme } from "next-themes";

import NavLink from "@/components/navLink";
import CategoryTags from "@/components/questions/CategoryTags";
import DifficultyTags from "@/components/questions/DifficultyTags";
import { History } from "@/types/history";
import { code } from "@nextui-org/theme";

interface HistoryDescriptionProps {
  username: string;
  session: History;
}

export default function HistoryDescription({
  username,
  session,
}: HistoryDescriptionProps) {
  const partner =
    session.userTwo == username ? session.userOne : session.userTwo;
  const question = session.question;
  const { theme } = useTheme();

  const formattedDate = new Date(session.createdAt).toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );

  let descriptionBgColor: string;
  let textColor: string;
  let codeBgColor: string;

  if (theme === "dark") {
    descriptionBgColor = "bg-gray-600 bg-opacity-70";
    textColor = "text-white";
    codeBgColor = "bg-gray-800";
  } else {
    descriptionBgColor = "bg-gray-300 bg-opacity-70";
    textColor = "text-black";
    codeBgColor = "bg-gray-100";
  }

  return (
    <Card className="p-3 m-3">
      <CardHeader className="flex justify-between items-start">
        <div className="flex flex-col space-y-3">
          <h2 className="font-bold text-2xl">{question.title}</h2>
          <div className="text-med">
            Complexity:&nbsp;
            <DifficultyTags difficulty={question.complexity} />
          </div>
          <CategoryTags
            categories={question.category}
            questionId={question.questionId || ""}
          />
        </div>
        <div className="text-right ml-4">
          <p className="text-sm font-semibold">{`Partner: ${partner}`}</p>
          <p className="text-sm font-semibold">{`Date: ${formattedDate}`}</p>
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
              {question.description}
            </code>
          </pre>
        </div>
        <p className="my-3 text-lg font-semibold">Code</p>
        <div
          className="max-h-[300px] overflow-y-auto p-4 rounded-md shadow-inner"
          style={{ backgroundColor: codeBgColor }}
        >
          <pre className="text-sm leading-relaxed whitespace-pre-wrap font-mono text-left">
            <code className="text-pretty">
              {session.code || "No code available."}
            </code>
          </pre>
        </div>
      </CardBody>
      <CardFooter>
        <NavLink hover={true} href="/history">
          Back to history
        </NavLink>
      </CardFooter>
    </Card>
  );
}
