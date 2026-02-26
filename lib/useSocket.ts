"use client";

import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";

let socket: Socket | null = null;

export const useSocket = (gameId: string, onUpdate: () => void) => {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!gameId) return;

    const socketInitializer = async () => {
      // Trigger the API route to initialize the socket server
      await fetch("/api/socket");

      if (!socket) {
        socket = io({
          path: "/api/socket",
          addTrailingSlash: false,
        });
      }

      socket.on("connect", () => {
        console.log("Socket connected on client");
        setConnected(true);
        socket?.emit("join-game", gameId);
      });

      socket.on("game-updated", () => {
        console.log("Real-time update received: game-updated");
        onUpdate();
      });

      socket.on("player-joined", () => {
        console.log("Real-time update received: player-joined");
        onUpdate();
      });

      socket.on("game-started", () => {
        console.log("Real-time update received: game-started");
        onUpdate();
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected on client");
        setConnected(false);
      });
    };

    socketInitializer();

    return () => {
      // We don't necessarily want to disconnect the global socket 
      // when one component unmounts, but we can remove listeners
      socket?.off("game-updated");
      socket?.off("player-joined");
      socket?.off("game-started");
    };
  }, [gameId, onUpdate]);

  return { socket, connected };
};
