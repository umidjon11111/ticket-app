import { io } from "socket.io-client";

const URL = "http://localhost:5000";

// 🔥 Bitta global socket instance
const socket = io(URL, {
  autoConnect: false, // biz o‘zimiz boshqaramiz
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
});

export function initSocket(room: string) {
  if (!socket.connected) socket.connect();

  socket.on("connect", () => {
    console.log("🟢 Connected:", socket.id);
    socket.emit("join_room", room);
  });

  socket.on("disconnect", (reason) => {
    console.warn("❌ Disconnected:", reason);
  });

  return socket;
}

export default socket;
