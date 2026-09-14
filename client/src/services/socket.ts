import { io, Socket } from 'socket.io-client';

// Helper to get socket URL from either VITE_SOCKET_URL or VITE_API_URL
const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  if (import.meta.env.VITE_API_URL) {
    // If they provided API URL (e.g., https://xxx.onrender.com/api), strip the /api part
    return import.meta.env.VITE_API_URL.replace(/\/api$/, '');
  }
  return import.meta.env.DEV ? 'http://localhost:5000' : window.location.origin;
};

const SOCKET_URL = getSocketUrl();
let socketInstance: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });
  }
  return socketInstance;
};
