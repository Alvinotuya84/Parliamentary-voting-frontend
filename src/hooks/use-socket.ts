import { useEffect, useCallback } from "react";
import { Socket } from "socket.io-client";

import SocketService from "@/lib/socket";
import { useSessionStore } from "../../stores/session-store";
import { useMotionStore } from "../../stores/motion-store";

type SocketEventCallback = (data: any) => void;

export const useSocket = () => {
  const { activeMotionId } = useSessionStore();
  const { isVotingActive } = useMotionStore();

  // Get socket instance
  const socket = SocketService.getSocket();

  // Join motion room
  const joinMotion = useCallback(
    (motionId: string) => {
      socket.emit("joinMotion", motionId);
    },
    [socket]
  );

  // Leave motion room
  const leaveMotion = useCallback(
    (motionId: string) => {
      socket.emit("leaveMotion", motionId);
    },
    [socket]
  );

  // Subscribe to events
  const subscribe = useCallback(
    (event: string, callback: SocketEventCallback) => {
      socket.on(event, callback);
      return () => {
        socket.off(event, callback);
      };
    },
    [socket]
  );

  // Emit events
  const emit = useCallback(
    (event: string, data: any) => {
      socket.emit(event, data);
    },
    [socket]
  );

  // Auto-join motion room when activeMotionId changes
  useEffect(() => {
    if (activeMotionId && isVotingActive) {
      joinMotion(activeMotionId);
      return () => {
        leaveMotion(activeMotionId);
      };
    }
  }, [activeMotionId, isVotingActive, joinMotion, leaveMotion]);

  return {
    socket,
    joinMotion,
    leaveMotion,
    subscribe,
    emit,
  };
};
