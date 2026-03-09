import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket, initSocket } from '@/lib/socket';
import { useAuthStore } from '@/stores/authStore';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (!accessToken) return;

    // Initialize socket if not already connected
    if (!socketRef.current || !socketRef.current.connected) {
      socketRef.current = initSocket(accessToken);
    }

    return () => {
      // Don't disconnect on unmount - socket should persist across components
    };
  }, [accessToken]);

  return {
    socket: socketRef.current || getSocket(),
    isConnected: socketRef.current?.connected || false,
  };
};

export const useSocketEvent = <T = unknown>(
  event: string,
  handler: (data: T) => void
) => {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on(event, handler);

    return () => {
      socket.off(event, handler);
    };
  }, [socket, event, handler]);
};
