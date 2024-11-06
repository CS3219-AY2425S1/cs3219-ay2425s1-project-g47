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
  useGetInfo,
  useGetIsAuthorisedUser,
  useSaveCode,
} from "@/hooks/api/collaboration";
import { SaveCodeVariables } from "@/utils/collaboration";

export default function Page() {
  const [output, setOutput] = useState("Your output will appear here...");
  const code = useRef("");
  const language = useRef("");
  const router = useRouter();
  const params = useParams();
  const roomId = params?.roomId || "";

  const socket = useContext(SocketContext);
  const { user } = useUser();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [otherUserEnd, setOtherUserEnd] = useState<boolean>(false);
  const [otherUser, setOtherUser] = useState<string>("");
  const [question, setQuestion] = useState<Question>({
    title: "",
    complexity: "",
    category: [],
    description: "",
    examples: "",
    constraints: "",
  });

  const { data: roomInfo, isPending: isQuestionPending } = useGetInfo(
    roomId as string,
  );

  const {
    data: isAuthorisedUser,
    isPending: isAuthorisationPending,
    isError,
  } = useGetIsAuthorisedUser(roomId as string, user?.username as string);

  const { mutate: saveCode } = useSaveCode();

  const handleCodeChange = (newCode: string) => {
    code.current = newCode;
  };

  const saveCodeAndEndSession = (savedCode: SaveCodeVariables) => {
    saveCode(
      { ...savedCode },
      {
        onSuccess: () => {
          socket?.emit("user-end", roomId, user?.id);
          router.push("/match");
        },
        onError: (error) => {
          console.error("Error saving code:", error);
          router.push("/match");
        },
      },
    );
  };

  const handleEndSession = (): void => {
    socket?.off("other-user-end");

    saveCodeAndEndSession({
      roomId: roomId as string,
      code: code.current,
      language: language.current,
    });
  };

  useEffect(() => {
    if (!isAuthorisationPending && !isAuthorisedUser?.authorised) {
      router.push("/403");
    }
  }, [isAuthorisationPending, isAuthorisedUser, router]);

  useEffect(() => {
    if (!isQuestionPending && roomInfo) {
      const matchedQuestion = roomInfo?.question;

      if (roomInfo.userOne !== user?.username) {
        setOtherUser(roomInfo.userOne);
      } else {
        setOtherUser(roomInfo.userTwo);
      }

      setQuestion({
        title: matchedQuestion?.title || "",
        complexity: matchedQuestion?.complexity || "",
        category: matchedQuestion?.category || [],
        description: matchedQuestion?.description || "",
        examples: matchedQuestion?.examples || "",
        constraints: matchedQuestion?.constraints || "",
      });

      language.current = roomInfo["programming_language"]?.[0] || "";
    }
  }, [isQuestionPending, roomInfo, user]);

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
        toast.info(
          `User ${otherUser} disconnected, you can wait or exit the session.`,
          {
            position: "top-left",
            autoClose: 2000,
            hideProgressBar: false,
          },
        );
        setOtherUser("");
      };

      const handleOtherUserEnd = () => {
        setOtherUserEnd(true);
      };

      socket.on("user-disconnect", handleUserDisconnect);
      socket.on("other-user-end", handleOtherUserEnd);

      // Cleanup function to remove listeners on unmount or when dependencies change
      return () => {
        socket.off("user-disconnect", handleUserDisconnect);
        socket.off("other-user-end", handleOtherUserEnd);
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
                language={language.current || "javaScript"}
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
                    <p>
                      Are you sure you want to exit the session? This action
                      cannot be undone and the room will be closed.
                    </p>
                  </ModalBody>
                  <ModalFooter>
                    <Button color="danger" variant="light" onPress={onClose}>
                      No
                    </Button>
                    <Button
                      color="primary"
                      onPress={() => {
                        handleEndSession();
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
            isOpen={otherUserEnd}
          >
            <ModalContent>
              {() => (
                <>
                  <ModalHeader className="flex flex-col gap-1">
                    The other user exited the session.
                  </ModalHeader>
                  <ModalBody>
                    <p>The session ended and this room is no longer open.</p>
                  </ModalBody>
                  <ModalFooter>
                    <Button
                      color="primary"
                      onPress={() => {
                        handleEndSession();
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
