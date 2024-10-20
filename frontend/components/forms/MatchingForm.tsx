import { useRef, useState, useContext } from "react";
import { Button } from "@nextui-org/button";
import { Card } from "@nextui-org/card";
import { v4 } from "uuid";

import ProgrammingLanguageSelectDropdown from "../matching/ProgrammingLanguageSelectDropdown";
import QuestionDifficultyDropDown from "../matching/DifficultyDropdown";
import TopicSelection from "../matching/TopicSelection";

import { UserMatchRequest, UserMatchResponse } from "@/types/match";
import { useAddUserToMatch } from "@/hooks/api/matching";
import { UserContext } from "@/context/UserContext";
import { User } from "@/types/user";

const CARD_STYLES = "w-9/12 gap-y-7 flex mx-auto flex-col justify-center p-16";

interface MatchingFormProps {
  onSuccess: (data: UserMatchResponse) => void;
  onCancel: () => void;
}
export default function MatchingForm({
  onSuccess,
  onCancel,
}: MatchingFormProps) {
  const questionDifficultyRef = useRef<string[]>([]);
  const programmingLanguagesRef = useRef<string[]>([]);
  const topicsRef = useRef<string[]>([]);
  const [invalidFields, setInvalidFields] = useState<Set<number>>(new Set());
  const userProps = useContext(UserContext);
  const onSuccessMatch = (responseData: UserMatchResponse) => {
    questionDifficultyRef.current = [];
    programmingLanguagesRef.current = [];
    topicsRef.current = [];
    onSuccess(responseData);
  };
  // initialise mutate hook to add user to match-service
  const {
    mutate,
    isPending: isPendingMatch,
    isError,
  } = useAddUserToMatch(onSuccessMatch);

  if (!userProps || userProps.user === null) {
    return <p>Invalid User</p>;
  }
  const user: User = userProps.user;
  // onSelect Handlers
  const onSelectQuestionDifficulty = (difficulties: string[]) => {
    questionDifficultyRef.current = difficulties;
  };

  const onSelectProgrammingLanguages = (languages: string[]) => {
    programmingLanguagesRef.current = languages;
  };

  const onSelectTopics = (topics: string[]) => {
    topicsRef.current = topics;
  };

  // validates and addUser
  const onSubmit = () => {
    const invalidSet: Set<number> = new Set();

    if (questionDifficultyRef.current.length < 1) {
      invalidSet.add(1);
    }
    if (programmingLanguagesRef.current.length < 1) {
      invalidSet.add(2);
    }
    if (topicsRef.current.length < 1) {
      invalidSet.add(3);
    }
    setInvalidFields(invalidSet);
    if (invalidSet.size !== 0) {
      return;
    }
    const socketId = v4();
    let generalize = false;
    let languages = programmingLanguagesRef.current;

    if (programmingLanguagesRef.current.includes("generalize")) {
      generalize = true;
      languages = [];
    }
    const userMatchRequest: UserMatchRequest = {
      user_id: user.id,
      socket_id: socketId,
      difficulty_levels: questionDifficultyRef.current,
      categories: topicsRef.current,
      programming_languages: languages,
      generalize_languages: generalize,
    };
    console.log(userMatchRequest);
    mutate(userMatchRequest);
  };

  return (
    <Card className={CARD_STYLES}>
      <h2 className="text-4xl">Session Details</h2>
      <ul className="flex flex-col gap-y-5 items-center">
        <li className="w-full">
          <QuestionDifficultyDropDown
            errorMessage="You must select at least one difficulty"
            isInvalid={invalidFields.has(1)}
            onSelect={onSelectQuestionDifficulty}
          />
        </li>
        <li className="w-full">
          <ProgrammingLanguageSelectDropdown
            errorMessage="You must select one programming language"
            isInvalid={invalidFields.has(2)}
            onSelect={onSelectProgrammingLanguages}
          />
        </li>
        <li className="w-full">
          <TopicSelection
            errorMessage="You must select a topic"
            isInvalid={invalidFields.has(3)}
            onSelect={onSelectTopics}
          />
        </li>
      </ul>
      <div className="flex items-center justify-end gap-5">
        <Button color="danger" onPress={onCancel}>
          Cancel
        </Button>
        <Button color="warning" isLoading={isPendingMatch} onPress={onSubmit}>
          Submit
        </Button>
      </div>
      {isError && (
        <h3 className="text-danger-500">
          Error Occurred While Adding User to Queue, Try Again
        </h3>
      )}
    </Card>
  );
}
