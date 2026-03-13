import { useEffect, useRef, useState } from 'react';
import { subscribeToMessages, unsubscribeFromMessages } from '@/lib/supabase';
import api from '@/lib/api';

interface UseRealtimeMessagesProps {
  parcelId: string | null;
  userId: string | undefined;
  enabled?: boolean;
}

export const useRealtimeMessages = ({
  parcelId,
  userId,
  enabled = true
}: UseRealtimeMessagesProps) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const channelRef = useRef<any>(null);
  const currentParcelIdRef = useRef<string | null>(null);

  // Fetch initial messages when parcel changes
  useEffect(() => {
    if (!parcelId || !userId || !enabled) {
      setMessages([]);
      return;
    }

    // Only fetch if parcel changed
    if (currentParcelIdRef.current === parcelId) {
      return;
    }

    currentParcelIdRef.current = parcelId;
    setIsLoading(true);

    const fetchMessages = async () => {
      try {
        const response = await api.get(`/messages/parcel/${parcelId}`);
        const msgs = response.data?.data || response.data || [];
        setMessages(msgs);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [parcelId, userId, enabled]);

  // Set up real-time subscription
  useEffect(() => {
    if (!parcelId || !userId || !enabled) {
      return;
    }

    // Clean up previous subscription
    if (channelRef.current) {
      unsubscribeFromMessages(channelRef.current);
      channelRef.current = null;
    }

    // Subscribe to new messages
    const handleNewMessage = async (newMessage: any) => {
      // Fetch full message details including sender info
      try {
        const response = await api.get(`/messages/parcel/${parcelId}`);
        const msgs = response.data?.data || response.data || [];

        // Find the new message in the fetched messages
        const fullMessage = msgs.find((m: any) => m.id === newMessage.id);

        if (fullMessage) {
          setMessages((prev) => {
            // Check if message already exists
            const exists = prev.some((m) => m.id === fullMessage.id);
            if (exists) {
              return prev;
            }
            return [...prev, fullMessage];
          });

          // Mark as read if I'm the receiver
          if (newMessage.receiverId === userId) {
            await api.post(`/messages/parcel/${parcelId}/mark-read`);
          }
        }
      } catch (error) {
        console.error('Failed to fetch new message details:', error);
        // Fallback: add basic message info
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === newMessage.id);
          if (exists) {
            return prev;
          }
          return [...prev, newMessage];
        });
      }
    };

    const handleMessageUpdate = (updatedMessage: any) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === updatedMessage.id ? { ...msg, ...updatedMessage } : msg
        )
      );
    };

    // Subscribe to real-time changes
    const channel = subscribeToMessages(
      parcelId,
      handleNewMessage,
      handleMessageUpdate
    );

    channelRef.current = channel;

    // Cleanup on unmount or when parcel changes
    return () => {
      if (channelRef.current) {
        unsubscribeFromMessages(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [parcelId, userId, enabled]);

  return {
    messages,
    isLoading,
    setMessages, // Allow manual message updates
  };
};
