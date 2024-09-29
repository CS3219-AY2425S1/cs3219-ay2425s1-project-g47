import { useRouter } from "next/router"
import { useGetQuestion } from "@/hooks/questions";

import QuestionDescription from "@/components/questions/QuestionDescription";

export default function QuestionDescriptionPage() {
    const router = useRouter();
    const { id: questionId } = router.query;
    const { data: question, isLoading, isError } = useGetQuestion(
        (Array.isArray(questionId) ? questionId[0] : questionId) as string
    );
    return (
        isLoading
        ? <h1>fetching question</h1>
        : isError || !question
        ? <p>Error fetching Question</p>
        : <QuestionDescription question={question}/>
    )
}