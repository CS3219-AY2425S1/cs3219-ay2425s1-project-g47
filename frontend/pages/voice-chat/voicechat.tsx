import { useState } from "react";

let localStream: MediaStream | null = null;
let peerConnection: RTCPeerConnection | null = null;
let ws: WebSocket | null = null;
let iceCandidateBuffer: RTCIceCandidateInit[] = []; // Buffer ICE candidates here

export default function VoiceChat() {
  const [roomID, setRoomID] = useState("");
  const [userID, setUserID] = useState("user1"); // Default to user1
  const [isChatStarted, setIsChatStarted] = useState(false);
  const [remoteDescriptionSet, setRemoteDescriptionSet] = useState(false); // Flag to track remote description

  const handleStartChat = () => {
    if (roomID) {
      startVoiceChat(roomID, userID);
      setIsChatStarted(true);
    } else {
      alert("Please create or enter a room ID");
    }
  };

  const startVoiceChat = (roomID: string, userID: string) => {
    ws = new WebSocket(
      `ws://localhost:8081/ws?roomID=${roomID}&userID=${userID}`,
    );

    ws.onopen = () => {
      console.log("WebSocket connection opened");
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        localStream = stream;
        setupPeerConnection(userID);
      })
      .catch((err) => console.error("Error accessing microphone:", err));

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      console.log("WebSocket message received:", message);

      // Inside ws.onmessage for handling offers in startVoiceChat
      if (message.type === "offer" && userID === "user2") {
        console.log(
          "Received offer from user1, setting remote description and creating an answer.",
        );
        peerConnection
          ?.setRemoteDescription(new RTCSessionDescription(message.offer))
          .then(() => {
            setRemoteDescriptionSet(true); // Remote description set, now process buffered ICE candidates
            peerConnection?.createAnswer().then((answer) => {
              console.log("Answer created, setting local description...");
              peerConnection?.setLocalDescription(answer);
              console.log("Sending answer via WebSocket...");
              ws?.send(
                JSON.stringify({
                  type: "answer",
                  answer: {
                    type: "answer", // Explicitly set the 'type' field to 'answer'
                    sdp: answer.sdp, // Include the SDP
                  },
                }),
              );
            });
          })
          .catch((err) => {
            console.error("Error setting remote description for offer:", err);
          });
      } else if (message.type === "answer" && userID === "user1") {
        console.log("Received answer from user2, setting remote description.");
        peerConnection
          ?.setRemoteDescription(new RTCSessionDescription(message.answer))
          .then(() => {
            setRemoteDescriptionSet(true);
            processBufferedICECandidates(); // Process buffered ICE candidates
          })
          .catch((err) => {
            console.error("Error setting remote description for answer:", err);
          });
      } else if (message.type === "ice") {
        if (remoteDescriptionSet) {
          // Only add ICE candidates after remote description is set
          console.log(
            "Received ICE candidate, adding to peer connection.",
            message.candidate,
          );
          peerConnection
            ?.addIceCandidate(new RTCIceCandidate(message.candidate))
            .catch((err) => {
              console.error("Error adding ICE candidate:", err);
            });
        } else {
          console.log(
            "Received ICE candidate but remote description is not set yet, buffering...",
          );
          iceCandidateBuffer.push(message.candidate); // Buffer the ICE candidate
        }
      }
    };
  };

  const processBufferedICECandidates = () => {
    console.log("Processing buffered ICE candidates...");
    iceCandidateBuffer.forEach((candidate) => {
      peerConnection
        ?.addIceCandidate(new RTCIceCandidate(candidate))
        .catch((err) => {
          console.error("Error adding buffered ICE candidate:", err);
        });
    });
    iceCandidateBuffer = []; // Clear the buffer after processing
  };

  const setupPeerConnection = (userID: string) => {
    peerConnection = new RTCPeerConnection();
    localStream
      ?.getTracks()
      .forEach((track) => peerConnection?.addTrack(track, localStream!));

    peerConnection!.onnegotiationneeded = () => {
      if (userID === "user1") {
        console.log("User1 creating offer...");
        peerConnection!
          .createOffer()
          .then((offer) => peerConnection?.setLocalDescription(offer))
          .then(() => {
            console.log("Sending offer via WebSocket...");
            if (peerConnection!.localDescription) {
              ws?.send(
                JSON.stringify({
                  type: "offer",
                  offer: peerConnection!.localDescription,
                }),
              );
            }
          })
          .catch((error) =>
            console.error("Error creating or setting offer:", error),
          );
      }
    };

    peerConnection!.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("ICE candidate generated:", event.candidate);
        ws?.send(
          JSON.stringify({
            type: "ice",
            candidate: event.candidate,
          }),
        );
      }
    };

    peerConnection!.ontrack = (event) => {
      const remoteAudio = new Audio();

      remoteAudio.srcObject = event.streams[0];
      remoteAudio.play();
    };
  };

  return (
    <div>
      <h2>WebRTC Voice Chat</h2>
      <div>
        <label htmlFor="roomID">Room ID:</label>
        <input
          id="roomID"
          placeholder="Enter Room ID"
          type="text"
          value={roomID}
          onChange={(e) => setRoomID(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="userID">Select User:</label>
        <select
          id="userID"
          value={userID}
          onChange={(e) => setUserID(e.target.value)}
        >
          <option value="user1">User 1</option>
          <option value="user2">User 2</option>
        </select>
      </div>
      <button disabled={isChatStarted} onClick={handleStartChat}>
        Start Voice Chat
      </button>
      {/* Disable the specific ESLint rule for the audio element */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio autoPlay controls id="remoteAudio" />
    </div>
  );
}
