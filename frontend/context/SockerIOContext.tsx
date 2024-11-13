"use client";

import React, {
  createContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import io, { type Socket } from "socket.io-client";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const socketIOURL = process.env.NEXT_PUBLIC_COLLABORATION_SERVICE_SOCKET_IO_URL;

export const SocketContext = createContext<Socket | null>(null);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!socketIOURL) {
      toast.error("Could not connect to the server", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      console.error("Server Error: Could not connect to the server");
      setLoading(false);
    } else {
      const socketIOInstance = io(socketIOURL, {
        path: process.env.NEXT_PUBLIC_COLLAB_SERVICE_PATH,
        transports: ["websocket"],
      });

      setLoading(false);
      setSocket(socketIOInstance);
      console.log("SocketIO instance connected");

      // Handle socket connection error
      socketIOInstance.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        toast.error("Socket connection failed", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: true,
        });
      });

      // Add beforeunload listener to disconnect socket on page unload
      const handleBeforeUnload = () => {
        if (socketIOInstance) {
          socketIOInstance.disconnect();
          console.log("SocketIO instance disconnected on page unload");
        }
      };

      window.addEventListener("beforeunload", handleBeforeUnload);

      // Cleanup function to disconnect socket
      return () => {
        socketIOInstance.disconnect();
        window.removeEventListener("beforeunload", handleBeforeUnload);
        console.log("SocketIO instance disconnected on component unmount");
      };
    }
  }, []);

  if (loading) {
    return null;
  }

  return (
    <SocketContext.Provider value={socket}>
      <ToastContainer />
      {children}
    </SocketContext.Provider>
  );
};
