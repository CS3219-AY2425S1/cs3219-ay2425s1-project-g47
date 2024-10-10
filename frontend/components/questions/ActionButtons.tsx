import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/modal";
import { Button } from "@nextui-org/button";
import { useRouter } from "next/router";
import { useState } from "react";

import { PencilIcon, TrashIcon } from "@/components/icons";
import { useDeleteQuestions } from "@/hooks/questions";
import { Question } from "@/types/questions";

interface ActionButtonsProps {
  question: Question;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ question }) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const { mutate: deleteQuestion } = useDeleteQuestions();

  const handleEditOnClick = () => {
    // Redirect to the edit page with only questionId
    router.push({
      pathname: `/questions/edit/${question.questionId}`,
    });
  };

  const confirmDelete = () => {
    setIsDeleting(true);

    if (!question.questionId) {
      setIsDeleting(false);

      return;
    }

    deleteQuestion(question.questionId, {
      onSuccess: () => {
        setIsDeleting(false);
      },
      onError: (error) => {
        alert(`Error: ${error}`);
        setIsDeleting(false);
      },
    });
  };

  return (
    <div className="flex gap-2 justify-center">
      {/* Edit Button */}
      <Button isIconOnly onPress={handleEditOnClick}>
        <PencilIcon />
      </Button>

      {/* Delete Button */}
      <Button isIconOnly disabled={isDeleting} onPress={onOpen}>
        <TrashIcon />
      </Button>

      {/* Confirmation Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Confirm Deletion
              </ModalHeader>
              <ModalBody>
                <p>
                  Are you sure you want to delete this question? This action
                  cannot be undone.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={confirmDelete}>
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ActionButtons;
