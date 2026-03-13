"use client";

import { useEffect, useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Send, Package, ArrowLeft, Plane, User } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import { useAuthStore } from "@/stores/authStore";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";

export default function MessagesPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any | null>(
    null,
  );
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [viewMode, setViewMode] = useState<'sender' | 'traveller'>('sender');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);

  // Use real-time messages hook
  const { messages, isLoading: messagesLoading, setMessages } = useRealtimeMessages({
    parcelId: selectedConversation?.parcelId || null,
    userId: user?.id,
    enabled: !!selectedConversation,
  });

  useEffect(() => {
    fetchConversations();
    // Set up polling for conversations list (updates every 10 seconds)
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    filterConversationsByMode();
  }, [conversations, viewMode]);

  const filterConversationsByMode = () => {
    if (!conversations || conversations.length === 0) {
      setFilteredConversations([]);
      return;
    }

    // Filter conversations based on the current view mode
    // In sender mode: show conversations where user is the parcel sender (matched with travellers)
    // In traveller mode: show conversations where user is the traveller (matched with senders)
    const filtered = conversations.filter((conv) => {
      if (viewMode === 'sender') {
        // Show conversations where I'm the sender (other person is traveller)
        return conv.userRole === 'sender';
      } else {
        // Show conversations where I'm the traveller (other person is sender)
        return conv.userRole === 'traveller';
      }
    });

    setFilteredConversations(filtered);
  };

  const fetchConversations = async () => {
    try {
      const response = await api.get("/messages");
      const convs = response.data?.data || response.data || [];
      setConversations(convs);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
      if (isLoading) {
        toast.error("Failed to load conversations");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !user) return;
    setIsSending(true);
    try {
      const response = await api.post("/messages", {
        parcelId: selectedConversation.parcelId,
        receiverId: selectedConversation.otherUser.id,
        content: newMessage.trim(),
      });
      const sentMessage = response.data?.data || response.data;

      // The real-time subscription will handle adding the message
      // But we optimistically add it for immediate feedback
      setMessages((prev) => {
        const exists = prev.some(m => m.id === sentMessage.id);
        if (exists) return prev;
        return [...prev, sentMessage];
      });

      setNewMessage("");

      // Update conversation list
      setConversations((prev) =>
        prev.map((conv) =>
          conv.parcelId === selectedConversation.parcelId
            ? { ...conv, lastMessage: sentMessage, updatedAt: sentMessage.createdAt }
            : conv,
        ),
      );
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Messages</h2>
          <p className="text-muted-foreground mt-2">
            Chat with your matched {viewMode === 'sender' ? 'travellers' : 'senders'}
          </p>
        </div>
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'sender' | 'traveller')}>
          <TabsList>
            <TabsTrigger value="sender" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Sender Mode
            </TabsTrigger>
            <TabsTrigger value="traveller" className="flex items-center gap-2">
              <Plane className="h-4 w-4" />
              Traveller Mode
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Conversations</CardTitle>
            <CardDescription>
              {filteredConversations.length} active{" "}
              {filteredConversations.length === 1 ? "chat" : "chats"} as {viewMode}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[calc(100vh-320px)] overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-12 px-4 text-muted-foreground">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No conversations yet</p>
                  <p className="text-sm mt-2">
                    {viewMode === 'sender'
                      ? 'Messages with matched travellers will appear here'
                      : 'Messages with matched senders will appear here'}
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredConversations.map((conversation) => (
                    <button
                      key={conversation.parcelId}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`w-full p-4 text-left hover:bg-accent transition-colors ${selectedConversation?.parcelId === conversation.parcelId ? "bg-accent" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {conversation.otherUser?.firstName?.[0]}
                            {conversation.otherUser?.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm truncate">
                                {conversation.otherUser?.firstName}{" "}
                                {conversation.otherUser?.lastName}
                              </p>
                              <Badge variant="outline" className="h-5 px-1.5 text-xs">
                                {viewMode === 'sender' ? (
                                  <><Plane className="h-3 w-3 mr-1" />Traveller</>
                                ) : (
                                  <><User className="h-3 w-3 mr-1" />Sender</>
                                )}
                              </Badge>
                            </div>
                            {conversation.unreadCount > 0 && (
                              <Badge
                                variant="destructive"
                                className="h-5 px-1.5 text-xs"
                              >
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Package className="h-3 w-3" />
                            {conversation.parcelTitle}
                          </p>
                          {conversation.lastMessage ? (
                            <>
                              <p className="text-sm text-muted-foreground truncate mt-1">
                                {conversation.lastMessage.senderId === user?.id
                                  ? "You: "
                                  : ""}
                                {conversation.lastMessage.content}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(
                                  new Date(conversation.lastMessage.createdAt),
                                  { addSuffix: true },
                                )}
                              </p>
                            </>
                          ) : (
                            <p className="text-sm text-muted-foreground italic mt-1">
                              Start the conversation
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden"
                    onClick={() => setSelectedConversation(null)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {selectedConversation.otherUser?.firstName?.[0]}
                      {selectedConversation.otherUser?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">
                        {selectedConversation.otherUser?.firstName}{" "}
                        {selectedConversation.otherUser?.lastName}
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {viewMode === 'sender' ? (
                          <><Plane className="h-3 w-3 mr-1" />Traveller</>
                        ) : (
                          <><User className="h-3 w-3 mr-1" />Sender</>
                        )}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Package className="h-3 w-3" />
                      {selectedConversation.parcelTitle}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[calc(100vh-440px)] overflow-y-auto p-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <div className="text-center">
                        <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">
                          No messages yet. Start the conversation!
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => {
                        const isOwnMessage = message.senderId === user?.id;
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg px-4 py-2 ${isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                            >
                              <p className="text-sm break-words">
                                {message.content}
                              </p>
                              <p
                                className={`text-xs mt-1 ${isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                              >
                                {format(new Date(message.createdAt), "h:mm a")}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>
                <div className="border-t p-4">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={isSending}
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      disabled={isSending || !newMessage.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Select a conversation</p>
                <p className="text-sm mt-2">
                  Choose a conversation from the list to start messaging
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
