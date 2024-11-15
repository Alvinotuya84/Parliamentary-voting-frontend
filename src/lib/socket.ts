import { io, Socket } from "socket.io-client";
import { siteConfig } from "@/config/site";

class SocketService {
  private static instance: Socket | null = null;

  public static getSocket(): Socket {
    if (!this.instance) {
      this.instance = io(siteConfig.wsUrl, {
        transports: ["websocket"],
        autoConnect: true,
      });

      // Global socket event handlers
      this.instance.on("connect", () => {
        console.log("Socket connected");
      });

      this.instance.on("disconnect", () => {
        console.log("Socket disconnected");
      });

      this.instance.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });
    }

    return this.instance;
  }

  public static disconnect(): void {
    if (this.instance) {
      this.instance.disconnect();
      this.instance = null;
    }
  }
}

export default SocketService;
