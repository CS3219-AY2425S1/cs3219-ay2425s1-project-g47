import { NextApiRequest } from "next";
import { Server } from "ws";

export default function websocketHandler(req: NextApiRequest, res: any) {
  if (res.socket.server.ws) {
    console.log("WebSocket server already running");
    res.end();

    return;
  }

  // Create WebSocket server
  const wss = new Server({ noServer: true });

  res.socket.server.ws = wss;

  // Handle WebSocket connections
  wss.on("connection", (ws) => {
    ws.on("message", (message) => {
      const parsedMessage = JSON.parse(message.toString());

      // Broadcast the message to other connected clients
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === client.OPEN) {
          client.send(JSON.stringify(parsedMessage));
        }
      });
    });
  });

  console.log("WebSocket server started");
  res.end();
}

export const config = {
  api: {
    bodyParser: false, // Disables body parsing for WebSocket handling
  },
};
