import { useState, useRef, ReactNode, useEffect } from "react";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import MatchingForm from "../forms/MatchingForm";

import MatchingTimer from "./MatchingTimer";

import { SuccessfulMatchResponse, UserMatchResponse } from "@/types/match";
import createWebSocket from "@/utils/webSocket";
import { useCancelUserMatch } from "@/hooks/api/matching";

export default function MatchingPageBody() {
  const [userMatchInfo, setUserMatchInfo] = useState<
    UserMatchResponse | undefined
  >(undefined);
  const webSocketRef = useRef<WebSocket | null>(null);
  const router = useRouter();

  const onCancelSuccess = () => {
    toast.dismiss();
    toast.error("Match Cancelled", {
      className: "z-50",
      autoClose: 2000,
    });
    if (webSocketRef.current) {
      webSocketRef.current.close();
      webSocketRef.current = null;
    }
    setUserMatchInfo(undefined);
  };
  const { isError: isCancelError, mutate } =
    useCancelUserMatch(onCancelSuccess);
  //   start of webSocket Handlers
  const onWebSocketMessage = (event: MessageEvent) => {
    console.log("Message recevied from server:", event);
    try {
      const messageData = JSON.parse(event.data);

      if (
        typeof messageData !== "undefined" &&
        messageData !== "null" &&
        typeof messageData === "object" &&
        typeof messageData.state === "string" &&
        typeof messageData.user1 === "string" &&
        typeof messageData.user2 === "string"
      ) {
        const matchedResponse: SuccessfulMatchResponse = messageData;

        if (matchedResponse.state.toLowerCase() !== "matched") {
          return;
        }
        if (webSocketRef.current) {
          webSocketRef.current.close();
          webSocketRef.current = null;
        }
        toast.dismiss();
        toast.success("Successfully Matched. Redirecting to Collaboration", {
          className: "z-50 bg-success-100 text-wrap",
          autoClose: 1500,
        });
        setTimeout(() => router.push("/collaboration"), 2000);
      }
    } catch (error) {
      return;
    }
  };

  const onCloseWebSocket = () => {
    console.log("Successfully Closed Connection");
  };

  const onErrorWebSocket = () => {
    toast.dismiss();
    toast.error("Error occured while matching", {
      className: "z-50",
      autoClose: 2000,
    });
    if (webSocketRef.current) {
      webSocketRef.current.close();
      setUserMatchInfo(undefined);
    }
  };

  useEffect(() => {
    if (userMatchInfo === undefined) {
      if (webSocketRef.current) {
        webSocketRef.current.close();
        webSocketRef.current = null;
      }

      return;
    }
    const { socket_id: socketId } = userMatchInfo;

    webSocketRef.current = createWebSocket(
      socketId,
      onCloseWebSocket,
      onErrorWebSocket,
      onWebSocketMessage,
    );
    // Close the WebSocket when the component unmounts or the user leaves the page
    const handleUnload = () => {
      if (
        webSocketRef.current &&
        webSocketRef.current.readyState === WebSocket.OPEN
      ) {
        webSocketRef.current.close();
        console.log("WebSocket closed due to page unload or refresh");
        mutate(userMatchInfo.user_id);
      }
    };

    window.addEventListener("beforeunload", handleUnload);

    // Cleanup function
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      if (webSocketRef.current) {
        webSocketRef.current.close();
        webSocketRef.current = null;
        console.log("WebSocket closed due to component unmount");
      }
    };
  }, [userMatchInfo]);
  // end of WebSocket Handlers

  // start of addMatch Handlers
  const onSuccessAddMatch = (responseData: UserMatchResponse) => {
    toast.dismiss();
    toast.success("Add User To Queue", {
      className: "z-50 bg-success-100",
      autoClose: 2000,
    });
    setUserMatchInfo(responseData);
  };
  const onCancelMatch = () => {
    router.push("/questions");
  };
  //   end of addMatch handlers
  //   start of cancel Match
  const onCancelTimer = () => {
    if (userMatchInfo === undefined) {
      return;
    }
    mutate(userMatchInfo.user_id);
  };
  let content: ReactNode;

  if (userMatchInfo !== undefined) {
    content = (
      <>
        <MatchingTimer seconds={30} onCancel={onCancelTimer} />
        {isCancelError && <div>Error Cancelling Match</div>}
      </>
    );
  } else {
    content = (
      <MatchingForm onCancel={onCancelMatch} onSuccess={onSuccessAddMatch} />
    );
  }

  return (
    <>
      {content}
      <ToastContainer className="z-5" />
    </>
  );
}
