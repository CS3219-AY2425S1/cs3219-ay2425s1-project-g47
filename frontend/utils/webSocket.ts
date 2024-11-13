export default function createWebSocket(
  socketId: string,
  onClose: () => void,
  onError: () => void,
  onMessage: (event: MessageEvent) => void,
): WebSocket {
  const ws = new WebSocket(`ws://localhost:3002/ws?socket_id=${socketId}`);

  // define openEvent handler
  ws.onopen = (event) => {
    console.log("Connected to Server");
    ws.send("Hello Server From Client");
  };

  // define onClose behavior
  ws.onclose = onClose;

  // define error
  ws.onerror = onError;

  // define behaviour for message
  ws.onmessage = onMessage;

  return ws;
}
