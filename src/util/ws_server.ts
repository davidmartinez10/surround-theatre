const ws = nw.require("ws") as typeof import("ws");
console.log(ws);

// const wss = new WebSocketServer({ port: 8080 });

// wss.on("connection", (ws) => {
//   console.log("Client connected");
// });

// wss.on("error", (error) => {
//   console.error("WebSocket error:", error);
// });