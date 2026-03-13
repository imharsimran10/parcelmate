import { createClient } from '@supabase/supabase-js';

// Supabase configuration for real-time features
// The client connects directly to Supabase, bypassing our Vercel backend
// This allows real-time messaging even on serverless deployments

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Real-time features will not work.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Helper to subscribe to message changes for a specific parcel
export const subscribeToMessages = (
  parcelId: string,
  onNewMessage: (message: any) => void,
  onMessageUpdate: (message: any) => void
) => {
  const channel = supabase
    .channel(`messages:${parcelId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `parcelId=eq.${parcelId}`,
      },
      (payload) => {
        console.log('New message received:', payload);
        onNewMessage(payload.new);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `parcelId=eq.${parcelId}`,
      },
      (payload) => {
        console.log('Message updated:', payload);
        onMessageUpdate(payload.new);
      }
    )
    .subscribe();

  return channel;
};

// Helper to unsubscribe from message changes
export const unsubscribeFromMessages = (channel: any) => {
  if (channel) {
    supabase.removeChannel(channel);
  }
};

// Subscribe to all messages for a user (for unread count updates)
export const subscribeToUserMessages = (
  userId: string,
  onMessageReceived: (message: any) => void
) => {
  const channel = supabase
    .channel(`user-messages:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiverId=eq.${userId}`,
      },
      (payload) => {
        console.log('New message for user:', payload);
        onMessageReceived(payload.new);
      }
    )
    .subscribe();

  return channel;
};
