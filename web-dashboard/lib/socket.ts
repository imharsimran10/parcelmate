import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

// WebSockets are disabled on Vercel serverless deployment
const WEBSOCKETS_ENABLED = process.env.NEXT_PUBLIC_WEBSOCKETS_ENABLED === 'true';

export const initSocket = (token: string): Socket | null => {
  // Skip socket initialization if WebSockets are disabled
  if (!WEBSOCKETS_ENABLED) {
    console.log('WebSockets are disabled in production deployment');
    return null;
  }

  if (socket?.connected) {
    return socket;
  }

  socket = io(process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:3000', {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Typed event emitters and listeners
export const socketEmit = (event: string, data?: unknown): void => {
  if (socket?.connected) {
    socket.emit(event, data);
  } else {
    console.warn('Socket not connected, cannot emit event:', event);
  }
};

export const socketOn = (event: string, callback: (...args: unknown[]) => void): void => {
  if (socket) {
    socket.on(event, callback);
  }
};

export const socketOff = (event: string, callback?: (...args: unknown[]) => void): void => {
  if (socket) {
    socket.off(event, callback);
  }
};
