"use client";

import { useState, useContext, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/modal";
import { Button } from "@nextui-org/button";
import { Avatar } from "@nextui-org/avatar";
import { toast } from "react-toastify";

import { Question } from "@/types/questions";
import QuestionDescription from "@/components/questions/QuestionDescription";
import { SocketContext } from "@/context/SockerIOContext";
import { useUser } from "@/hooks/users";
import CodeEditor from "@/components/collaboration/CodeEditor";
import VoiceChat from "@/components/collaboration/VoiceChat";
import {
  useGetMatchedQuestion,
  useGetIsAuthorisedUser,
  useSaveCode,
} from "@/hooks/api/collaboration";
import { SaveCodeVariables } from "@/utils/collaboration";

export default function Page() {
  const [output, setOutput] = useState("Your output will appear here...");
  const code = useRef("");
  const [language, setLanguage] = useState("JavaScript");
  const router = useRouter();
  const params = useParams();
  const roomId = params?.roomId || "";

  const socket = useContext(SocketContext);
  const { user } = useUser();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [otherUserDisconnect, setUserDisconnect] = useState<boolean>(false);
  const [otherUser, setOtherUser] = useState<string>("");
  const [question, setQuestion] = useState<Question>({
    title: "",
    complexity: "",
    category: [],
    description: "",
    examples: "",
    constraints: "",
  });

  const { mutate: saveCode } = useSaveCode();

  const handleCodeChange = (newCode: string) => {
    code.current = newCode;
  };

  const saveCodeAndEndSession = (savedCode: SaveCodeVariables) => {
    saveCode(
      { ...savedCode },
      {
        onSuccess: () => {
          toast.success("Code saved successfully");
          router.push("/match");
        },
        onError: (error) => {
          console.error("Error saving code:", error);
          toast.error("Error saving code");
          router.push("/match");
        }
      },
    );
  };

  const { data: roomInfo, isPending: isQuestionPending } =
    useGetMatchedQuestion(roomId as string);

  const {
    data: isAuthorisedUser,
    isPending: isAuthorisationPending,
    isError,
  } = useGetIsAuthorisedUser(roomId as string, user?.id as string);

  useEffect(() => {
    if (!isAuthorisationPending && !isAuthorisedUser?.authorised) {
      // router.push("/403");
    }
  }, [isAuthorisationPending, isAuthorisedUser, router]);

  const handleEndSession = (): void => {
    socket?.emit("user-agreed-end", roomId, user?.id);
  };

  useEffect(() => {
    if (!isQuestionPending) {
      const matchedQuestion = roomInfo.question;

      setQuestion({
        title: matchedQuestion?.title || "",
        complexity: matchedQuestion?.complexity || "",
        category: matchedQuestion?.category || [],
        description: matchedQuestion?.description || "",
        examples: matchedQuestion?.examples || "",
        constraints: matchedQuestion?.constraints || "",
      });
    }
  }, [isQuestionPending, setQuestion]);

  useEffect(() => {
    if (socket && roomId && user) {
      socket.emit("join-room", roomId, user?.username);

      socket.on("user-join", (otherUser) => {
        if (otherUser !== user?.username) {
          toast.info(`User ${otherUser} has joined the room`, {
            position: "top-right",
            autoClose: 1000,
            hideProgressBar: false,
          });
          setOtherUser(otherUser);
        }
      });

      // Setup socket listeners
      const handleUserDisconnect = () => {
        setUserDisconnect(true);
        setOtherUser("");
      };

      const handleWaitingForOtherUserEnd = () => {
        toast.info("Waiting for both users to click exit.", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
        });
      };

      const handleBothUsersAgreedEnd = () => {
        saveCodeAndEndSession({
          roomId: roomId as string,
          code: code.current,
          language: language,
        }); // Call function to save code and redirect
      };

      socket.on("user-disconnect", handleUserDisconnect);
      socket.on("waiting-for-other-user-end", handleWaitingForOtherUserEnd);
      socket.on("both-users-agreed-end", handleBothUsersAgreedEnd);

      // Cleanup function to remove listeners on unmount or when dependencies change
      return () => {
        socket.off("user-disconnect", handleUserDisconnect);
        socket.off("waiting-for-other-user-end", handleWaitingForOtherUserEnd);
        socket.off("both-users-agreed-end", handleBothUsersAgreedEnd);
      };
    }
  }, [socket, roomId, user]);

  const isAvatarActive = (otherUser: string) => {
    return otherUser ? "success" : "default";
  };

  return (
    <>
      {isAuthorisationPending ? (
        <p>Loading...</p>
      ) : isError ? (
        <p>Had trouble authorising user!</p>
      ) : (
        <div>
          <div className="flex">
            {/* Question Section */}
            <div className="flex-[1.6_1.6_0%] border-r border-gray-700">
              <QuestionDescription isCollab={true} question={question} />
            </div>

            {/* Editor Section */}
            <div className="flex-[2_2_0%] p-2 border-r border-gray-700">
              <CodeEditor
                language={roomInfo["programming_language"][0] || "javaScript"}
                roomId={roomId as string}
                setOutput={setOutput}
                userEmail={user?.email || "unknown user"}
                userId={user?.id || "unknown user"}
                userName={user?.username || "unknown user"}
                onCodeChange={handleCodeChange}
              />
            </div>

            {/* Output Section */}
            <div className="flex-col flex-[1_1_0%] p-2 overflow-x-auto space-y-4">
              <div className="flex justify-between mb-1">
                <div className="flex space-x-4">
                  <Avatar
                    isBordered
                    color={isAvatarActive(otherUser)}
                    name={otherUser}
                  />
                  <Avatar isBordered color="success" name={user?.username} />
                </div>
                <Button
                  className="justify-self-end"
                  color="danger"
                  onPress={onOpen}
                >
                  Exit Session
                </Button>
              </div>
              <VoiceChat className="bg-primary-300 order-1 flex-initial" />
              <div className="border border-gray-700 rounded-lg p-2">
                <h3 className="font-semibold mb-2">Output:</h3>
                <div className="flex-1">
                  <pre className="break-words text-wrap overflow-y-scroll">
                    {output}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Modals */}
          <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="flex flex-col gap-1">
                    Exit Session
                  </ModalHeader>
                  <ModalBody>
                    <p>Did both users agree to exit the session?</p>
                  </ModalBody>
                  <ModalFooter>
                    <Button color="danger" variant="light" onPress={onClose}>
                      No
                    </Button>
                    <Button
                      color="primary"
                      onPress={() => {
                        handleEndSession();
                        onClose();
                      }}
                    >
                      Yes, Exit
                    </Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>

          <Modal
            hideCloseButton={true}
            isDismissable={false}
            isOpen={otherUserDisconnect}
          >
            <ModalContent>
              {() => (
                <>
                  <ModalHeader className="flex flex-col gap-1">
                    Other user disconnected
                  </ModalHeader>
                  <ModalBody>
                    <p>
                      The other user disconnected, the room will now be closed.
                    </p>
                  </ModalBody>
                  <ModalFooter>
                    <Button
                      color="primary"
                      onPress={() => {
                        router.push("/match");
                      }}
                    >
                      Back to match
                    </Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>
        </div>
      )}
    </>
  );
}
