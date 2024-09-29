import { Question } from "@/types/questions";

import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Divider } from "@nextui-org/divider";
import NavLink from "../navLink";

interface QuestionDescriptionProps {
    question: Question;
}

export default function QuestionDescription({ question }: QuestionDescriptionProps) {
    const { 
        questionId,
        title,
        complexity,
        category,
        description
    } = question;
    const outputObject = { questionId, title, complexity, category, description };
    const outputObjectKeys = Object.keys(outputObject);
    return (
        <Card className="p-4">
            <CardHeader>
                <div>
                    <h2>QuestionId: {questionId}</h2>
                    <h2>Title: {title}</h2>
                </div>
            </CardHeader>
            <Divider />
            <CardBody>
                <h3 className="mb-3">
                    complexity: {complexity}
                </h3>
                <Divider />
                <h3 className="mt-3">{category.length > 1 ? 'Categories' : 'Category'}</h3>
                <div className="p-3 flex gap-1 justify-center">
                    {category.map(category => <p>{category}</p>)}
                </div>
                <Divider />
                <p className="mt-3">
                    Question Description: {description}
                </p>
            </CardBody>
            <CardFooter>
                <NavLink href='/questions' isActive={true}>Back to questions</NavLink>
            </CardFooter>
    </Card>
    );
}