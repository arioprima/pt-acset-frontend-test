import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SOCKET_URL, {
    path: import.meta.env.VITE_SOCKET_PATH,
    transports: ["websocket"],
    reconnection: true,
    autoConnect: true,
})

socket.on("connect", () => {
    console.log("Connected to socket server");
});
socket.on("disconnect", () => {
    console.log("Disconnected from socket server");
});

socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
});

export default socket;