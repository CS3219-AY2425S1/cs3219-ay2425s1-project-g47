"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import { Button } from "@nextui-org/button";

import MatchingPageBody from "@/components/matching/MatchingPageBody";

export default function Page() {
  const router = useRouter();
  const [roomId, setRoomId] = useState<string>("");

  useEffect(() => {
    // Read the roomId cookie
    const cookies = document.cookie.split("; ");
    const roomIdCookie = cookies.find((cookie) => cookie.startsWith("roomId="));

    if (roomIdCookie) {
      const roomIdValue = roomIdCookie.split("=")[1];

      setRoomId(roomIdValue);
    }
  }, []);

  const isOpen = roomId !== "";

  return (
    <>
      <MatchingPageBody />

      <Modal hideCloseButton={true} isDismissable={false} isOpen={isOpen}>
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Existing Session
              </ModalHeader>
              <ModalBody>
                <p>You have an existing session, please rejoin the room.</p>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="primary"
                  onPress={() => {
                    router.push(`/collaboration/${roomId}`);
                  }}
                >
                  Back to session
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
