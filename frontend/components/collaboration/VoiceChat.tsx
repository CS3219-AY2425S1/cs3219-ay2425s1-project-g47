import React, { useState, useEffect, useRef } from "react";
import Peer, { MediaConnection } from "peerjs";
import { useParams } from "next/navigation";
import { Card, CardBody, CardFooter } from "@nextui-org/card";
import Cookies from "js-cookie";
import { Button } from "@nextui-org/react";
import { MicrophoneIcon } from "../icons";
import axios from "@/utils/axios";


interface VoiceChatProps {
  className?: string;
}

export default function VoiceChat({
  className: cardClassName,
}: VoiceChatProps) {
  const params = useParams();
  const roomID = params?.roomId as string;

  const [peer, setPeer] = useState<Peer | null>(null);
  const [call, setCall] = useState<MediaConnection | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peerID, setPeerID] = useState("");
  const [connectionPeerID, setConnectionPeerID] = useState("");
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const storedPeerID = Cookies.get("peerID");
  
    if (roomID) {
      console.log("Fetching peer IDs for room:", roomID);
  
      axios
        .get(`/voice-service/join/${roomID}`, {
          params: { peerID: storedPeerID || "" },
        })
        .then((response) => {
          const data = response.data;
          setPeerID(data.peerID);
          setConnectionPeerID(data.connectionPeerID || "");
          console.log("Received peer IDs:", data);
  
          // Update the cookie with the new peerID if it's not already stored
          if (data.peerID !== storedPeerID) {
            Cookies.set("peerID", data.peerID, { expires: 1 });
            console.log("peerID saved to cookie:", Cookies.get("peerID"));
          }
        })
        .catch((err) => console.error("Error fetching peer IDs:", err));
    }
  }, [roomID]);

  useEffect(() => {
    // Only initialize PeerJS if peerID exists and peer is not set
    if (peerID && !peer) {
      console.log("Initializing PeerJS instance with peerID:", peerID);
      const peerInstance = new Peer(peerID, {
        host: "localhost",
        port: 9000,
        path: "/",
      });

      setPeer(peerInstance);

      // Listen for incoming calls
      peerInstance.on("call", (incomingCall) => {
        console.log("Incoming call received");
        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then((stream) => {
            incomingCall.answer(stream);
            incomingCall.on("stream", (remoteStream) => {
              console.log("Remote stream received from caller");
              setRemoteStream(remoteStream);
            });
          })
          .catch((err) => console.error("Error accessing local media:", err));
      });

      peerInstance.on("open", (id) => {
        console.log("Peer connection open with ID:", id);
      });

      peerInstance.on("error", (err) => {
        console.error("PeerJS error:", err);
      });

      // Reconnect on disconnection
      peerInstance.on("disconnected", () => {
        console.log("Peer disconnected, attempting to reconnect...");
        peerInstance.reconnect();
      });

      peerInstance.on("close", () => {
        console.log("Peer connection closed");
      });

      // Cleanup on component unmount
      return () => {
        console.log("Destroying PeerJS instance");
        peerInstance.destroy();
        setPeer(null);
      };
    }
  }, [peerID]);

  useEffect(() => {
    if (peer && connectionPeerID) {
      console.log("Attempting to call connectionPeerID:", connectionPeerID);
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          const outgoingCall: MediaConnection = peer.call(
            connectionPeerID,
            stream,
          );

          setCall(outgoingCall);

          outgoingCall.on("stream", (remoteStream) => {
            console.log("Remote stream received from outgoing call");
            setRemoteStream(remoteStream);
          });

          outgoingCall.on("error", (err) => {
            console.error("Error in outgoing call:", err);
          });
        })
        .catch((err) => console.error("Error accessing local media:", err));
    }
  }, [peer, connectionPeerID]);

  // Set `srcObject` on the audio element directly through the ref
  useEffect(() => {
    if (audioRef.current && remoteStream) {
      console.log("Setting remote stream to audio element");
      audioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);
  const handleMute = () => setIsMuted((prev) => !prev);

  return (
    <Card className={cardClassName}>
      <CardBody>
        <h2>PeerJS Voice Chat</h2>
        <p>Room: {roomID}</p>
      </CardBody>
      <CardFooter>
        <div>
          {/* Disable the specific ESLint rule for the audio element */}
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio ref={audioRef} autoPlay muted={isMuted} />
          <Button
            className="flex items-center justify-center"
            color={isMuted ? "danger" : "primary"}
            onPress={handleMute}
          >
            <MicrophoneIcon />
            {isMuted && (
              <div className="absolute top-1/2 left-1 w-5/6 h-0.5 bg-white transform rotate-45" />
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
