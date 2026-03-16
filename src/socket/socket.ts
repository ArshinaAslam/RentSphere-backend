import { Server as SocketServer } from "socket.io";
import { container } from "tsyringe";

import { DI_TYPES } from "../common/di/types";

import type { IChatService } from "../services/interface/chat/IChatService";
import type { Server as HttpServer } from "http";
import type { Socket } from "socket.io";

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} seconds`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins} min ${secs} sec` : `${mins} minutes`;
}

interface ServerToClientEvents {
  "message:receive": (message: unknown) => void;
  "message:error": (data: { error: string }) => void;
  "conversation:updated": (data: {
    conversationId: string;
    lastMessage: string;
    lastMessageAt: string;
  }) => void;
  "typing:start": (data: { userId: string }) => void;
  "typing:stop": (data: { userId: string }) => void;
  "messages:read": (data: { conversationId: string }) => void;
  "user:status": (data: { userId: string; isOnline: boolean }) => void;

  "call:incoming": (data: {
    from: string;
    fromName: string;
    offer: RTCSessionDescriptionInit;
    conversationId: string;
    callType?: "audio" | "video" | undefined;
    callerRole?: "tenant" | "landlord" | undefined;
  }) => void;
  "call:answered": (data: { answer: RTCSessionDescriptionInit }) => void;
  "call:ice-candidate": (data: { candidate: RTCIceCandidateInit }) => void;
  "call:ended": () => void;
  "call:rejected": () => void;
}

interface ClientToServerEvents {
  "user:online": (userId: string) => void;
  "conversation:join": (conversationId: string) => void;
  "conversation:leave": (conversationId: string) => void;
  "message:send": (data: {
    conversationId: string;
    senderId: string;
    senderRole: "tenant" | "landlord";
    content: string;
    recipientId: string;
  }) => void;
  "typing:start": (data: { conversationId: string; userId: string }) => void;
  "typing:stop": (data: { conversationId: string; userId: string }) => void;
  "messages:read": (data: { conversationId: string; userId: string }) => void;

  "call:offer": (data: {
    to: string;
    offer: RTCSessionDescriptionInit;
    conversationId: string;
    fromName: string;
    callType?: "audio" | "video" | undefined;
    callerRole?: "tenant" | "landlord" | undefined;
  }) => void;
  "call:answer": (data: {
    to: string;
    answer: RTCSessionDescriptionInit;
  }) => void;
  "call:ice-candidate": (data: {
    to: string;
    candidate: RTCIceCandidateInit;
  }) => void;
  "call:end": (data: {
    to: string;
    duration?: number;
    callType?: "audio" | "video";
    conversationId?: string;
    senderRole?: "tenant" | "landlord" | undefined;
  }) => void;
  "call:reject": (data: {
    to: string;
    conversationId?: string | undefined;
    callType?: "audio" | "video" | undefined;
    senderRole?: "tenant" | "landlord" | undefined;
  }) => void;
}

interface SocketData {
  userId: string;
}

type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>;
let io: SocketServer<ClientToServerEvents, ServerToClientEvents>;
const onlineUsers = new Map<string, string>();

export const initSocket = (httpServer: HttpServer): SocketServer => {
  io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket: TypedSocket) => {
    socket.on("user:online", (userId: string) => {
      onlineUsers.set(userId, socket.id);
      socket.data.userId = userId;
      io.emit("user:status", { userId, isOnline: true });

      onlineUsers.forEach((_, onlineUserId) => {
        if (onlineUserId !== userId) {
          socket.emit("user:status", { userId: onlineUserId, isOnline: true });
        }
      });
    });

    socket.on("conversation:join", (conversationId: string) => {
      void socket.join(conversationId);
    });

    socket.on("conversation:leave", (conversationId: string) => {
      void socket.leave(conversationId);
    });

    // ── Send message via socket ──
    socket.on(
      "message:send",
      (data: {
        conversationId: string;
        senderId: string;
        senderRole: "tenant" | "landlord";
        content: string;
        recipientId: string;
      }) => {
        const chatService = container.resolve<IChatService>(
          DI_TYPES.ChatService,
        );

        chatService
          .sendMessage(data)
          .then((message) => {
            io.to(data.conversationId).emit("message:receive", message);
            io.to(data.conversationId).emit("conversation:updated", {
              conversationId: data.conversationId,
              lastMessage: data.content,
              lastMessageAt: new Date().toISOString(),
            });

            const recipientSocketId = onlineUsers.get(data.recipientId);
            if (recipientSocketId) {
              io.to(recipientSocketId).emit("conversation:updated", {
                conversationId: data.conversationId,
                lastMessage: data.content,
                lastMessageAt: new Date().toISOString(),
              });
            }
          })
          .catch((err: Error) => {
            socket.emit("message:error", { error: "Failed to send message" });
            console.error("Socket message error:", err.message);
          });
      },
    );

    // ── Typing indicators ──
    socket.on(
      "typing:start",
      (data: { conversationId: string; userId: string }) => {
        socket
          .to(data.conversationId)
          .emit("typing:start", { userId: data.userId });
      },
    );

    socket.on(
      "typing:stop",
      (data: { conversationId: string; userId: string }) => {
        socket
          .to(data.conversationId)
          .emit("typing:stop", { userId: data.userId });
      },
    );

    // ── Mark messages as read ──
    socket.on(
      "messages:read",
      (data: { conversationId: string; userId: string }) => {
        const chatService = container.resolve<IChatService>(
          DI_TYPES.ChatService,
        );

        chatService
          .markAsRead(data.conversationId, data.userId)
          .then(() => {
            socket.to(data.conversationId).emit("messages:read", {
              conversationId: data.conversationId,
            });
          })
          .catch((err: Error) => {
            console.error("Mark as read error:", err.message);
          });
      },
    );

    // ── Disconnect ──
    socket.on("disconnect", () => {
      const userId = socket.data.userId;
      if (userId) {
        onlineUsers.delete(userId);
        io.emit("user:status", { userId, isOnline: false });
      }
    });

    // Add inside io.on("connection") in socket.ts

    socket.on("call:offer", (data) => {
      const targetSocketId = onlineUsers.get(data.to);
      if (targetSocketId) {
        io.to(targetSocketId).emit("call:incoming", {
          from: socket.data.userId,
          fromName: data.fromName,
          offer: data.offer,
          conversationId: data.conversationId,
          callType: data.callType ?? "audio",
          callerRole: data.callerRole,
        });
      }
    });

    socket.on("call:answer", (data) => {
      const targetSocketId = onlineUsers.get(data.to);
      if (targetSocketId) {
        io.to(targetSocketId).emit("call:answered", { answer: data.answer });
      }
    });

    socket.on("call:ice-candidate", (data) => {
      const targetSocketId = onlineUsers.get(data.to);
      if (targetSocketId) {
        io.to(targetSocketId).emit("call:ice-candidate", {
          candidate: data.candidate,
        });
      }
    });

    // socket.on("call:end", (data) => {
    //   const targetSocketId = onlineUsers.get(data.to);
    //   if (targetSocketId) {
    //     io.to(targetSocketId).emit("call:ended");
    //   }
    // });

    socket.on("call:end", (data) => {
      const targetSocketId = onlineUsers.get(data.to);
      if (targetSocketId) {
        io.to(targetSocketId).emit("call:ended");
      }

      if (!data.conversationId || !data.senderRole) return;

      const conversationId = data.conversationId;
      const senderRole = data.senderRole;
      const chatService = container.resolve<IChatService>(DI_TYPES.ChatService);
      const duration = data.duration ?? 0;
      const callTypeLabel =
        data.callType === "video" ? "Video call" : "Voice call";
      const content =
        duration > 0
          ? `${callTypeLabel} • ${formatDuration(duration)}`
          : `${callTypeLabel} • No answer`;

      if (data.conversationId) {
        chatService
          .sendMessage({
            conversationId,
            senderId: socket.data.userId,
            senderRole,
            content,
          })
          .then((message) => {
            io.to(conversationId).emit("message:receive", message);
            io.to(conversationId).emit("conversation:updated", {
              conversationId,
              lastMessage: content,
              lastMessageAt: new Date().toISOString(),
            });
          })
          .catch(console.error);
      }
    });

    socket.on("call:reject", (data) => {
      const targetSocketId = onlineUsers.get(data.to);
      if (targetSocketId) {
        io.to(targetSocketId).emit("call:rejected");
      }

      if (!data.conversationId || !data.senderRole) return;

      const conversationId = data.conversationId;
      const senderRole = data.senderRole;
      const label = data.callType === "video" ? "Video call" : "Voice call";
      const content = `${label} • Rejected`;

      const chatService = container.resolve<IChatService>(DI_TYPES.ChatService);

      chatService
        .sendMessage({
          conversationId,
          senderId: socket.data.userId,
          senderRole,
          content,
        })
        .then((message) => {
          io.to(conversationId).emit("message:receive", message);
          io.to(conversationId).emit("conversation:updated", {
            conversationId,
            lastMessage: content,
            lastMessageAt: new Date().toISOString(),
          });
        })
        .catch((err: Error) =>
          console.error("Rejected call record error:", err.message),
        );
    });
  });

  return io;
};

export const getIO = (): SocketServer => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

export const isUserOnline = (userId: string): boolean =>
  onlineUsers.has(userId);
