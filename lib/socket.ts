// lib/socket.ts
import { io, Socket } from "socket.io-client";

const URL = "";
let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    socket = io(URL, {
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}
