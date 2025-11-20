// lib/socket.ts
import { io, Socket } from "socket.io-client";

const URL = "https://sakura-socket-tr04.onrender.com";
let socket: Socket | null = null;

export function initSocket(room: string) {
  if (!socket) {
    socket = io(URL, {
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("🟢 Connected:", socket?.id);
      socket?.emit("join_room", room);
    });
  } else {
    socket.emit("join_room", room);
  }

  return socket;
}

export function getSocket() {
  return socket;
}
