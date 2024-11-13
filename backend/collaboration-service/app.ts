import "dotenv/config";
import express, { Request, Response } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import { startRabbitMQ } from "./consumer";
import { authenticateAccessToken } from "./utils/jwt";
import mongoose from "mongoose";
import { checkAuthorisedUser, getInfoHandler, getHistoryHandler, saveCodeHandler, getSessionHandler, clearRoomIdCookie} from "./controllers/controller";
import { verifyAccessToken } from "./middleware/middleware";
import axios from "axios";

import { WebSocketServer } from "ws";

// set up y-server, y-server needs request parameter which socket.io does not offer
const setupWSConnection = require("y-websocket/bin/utils").setupWSConnection;

const yServer = createServer((_request, response) => {
  response.writeHead(200, { "Content-Type": "text/plain" });
  response.end("Binded");
});
const wss = new WebSocketServer({ server: yServer });

function onError(error: Error) {
  console.log("error", error);
}

function onListening() {
  console.log(`Listening on port ${process.env.Y_SERVER_PORT_NUM}`);
}

yServer.on("error", onError);
yServer.on("listening", onListening);

// Handle code editor.
wss.on("connection", async (ws, req) => {
  setupWSConnection(ws, req);
  console.log("y-server-connected");
});

yServer.listen(process.env.Y_SERVER_PORT_NUM, () => {
  console.log(`y-server Started on port ${process.env.Y_SERVER_PORT_NUM}`)
});

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const MONGO_URI_CS = process.env.MONGO_URI_CS;

const app = express();
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser()); // Add cookie-parser middleware

mongoose
  .connect(MONGO_URI_CS!)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Failed to connect to MongoDB:", error));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: FRONTEND_URL },
});

app.get("/check-authorization", verifyAccessToken, checkAuthorisedUser);
app.get("/get-info", verifyAccessToken, getInfoHandler);
app.get("/get-history", verifyAccessToken, getHistoryHandler);
app.get("/get-session", verifyAccessToken, getSessionHandler);
app.post("/save-code", saveCodeHandler);
app.post("/clear-cookie", clearRoomIdCookie);

// POST endpoint to submit code for execution
app.post("/code-execute", async (req: Request, res: Response) => {
  try {
    const { source_code, language_id } = req.body; 
    const url = `https://${process.env.REACT_APP_RAPID_API_HOST}/submissions`;
    const response = await axios.post(
      url,
      { source_code, language_id },
      {
        params: { base64_encoded: "false", fields: "*" }, 
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Host": process.env.REACT_APP_RAPID_API_HOST!,
          "X-RapidAPI-Key": process.env.REACT_APP_RAPID_API_KEY!,
        },
      }
    );

    const token = response.data.token;
    res.json({ token });
  } catch (err) {
    console.error("Error submitting code:", err);
    res.status(500).json({
      errors: [{ msg: "Something went wrong while submitting code." }],
    });
  }
});


// GET endpoint to check code execution status
app.get("/code-execute/:token", async (req: Request, res: Response) => {
  try {
    const token = req.params.token;
    const url = `https://${process.env.REACT_APP_RAPID_API_HOST}/submissions/${token}`;
    const response = await axios.get(url, {
      params: { base64_encoded: "false", fields: "*" },
      headers: {
        "X-RapidAPI-Host": process.env.REACT_APP_RAPID_API_HOST!,
        "X-RapidAPI-Key": process.env.REACT_APP_RAPID_API_KEY!,
      },
    });
    res.send(response.data);
  } catch (err) {
    console.error("Error fetching code execution result:", err);
    res.status(500).json({
      errors: [{ msg: "Something went wrong while fetching code execution result." }],
    });
  }
});

interface UsersAgreedEnd {
  [roomId: string]: Record<string, boolean>;
}

const usersAgreedEnd: UsersAgreedEnd = {};

io.on("connection", (socket) => {
  console.log("New connection:", socket.id);
  
  // Retrieve accessToken from cookies in the handshake headers
  const accessToken = socket.handshake.headers.cookie
    ?.split("; ")
    .find((cookie) => cookie.startsWith("accessToken="))
    ?.split("=")[1];

  if (!accessToken) {
    socket.emit("error", { errorMsg: "Not authorized, no access token" });
    socket.disconnect();
    return;
  }
  console.log("AccessToken received from cookie:", accessToken);

  authenticateAccessToken(accessToken)
    .then((user) => {
      socket.data.user = user;

      // Room joining
      socket.on("join-room", (roomId: string, username: string) => {
        socket.join(roomId);
        socket.data.roomId = roomId;
        socket.data.username = username;

        socket.emit("room-joined", roomId);
        io.to(roomId).emit("user-join", username);
      });

      // User-agreed-end event
      socket.on("user-end", (roomId: string, userId: string) => {
        console.log(userId + " ended")
        io.to(roomId).emit("other-user-end", roomId);
        }
      );

      // Handle disconnect
      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        if (socket.data.roomId) {
          io.to(socket.data.roomId).emit("user-disconnect", socket.data.username);
        }
      });
    })
    .catch((error) => {
      console.log("Authentication failed:", error);
      socket.emit("error", { errorMsg: "Not authorized, access token failed" });
      socket.disconnect();
    });
});

// Starting RabbitMQ Consumer
startRabbitMQ(io);

const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});