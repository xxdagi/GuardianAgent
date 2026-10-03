import { Conversation } from "@elevenlabs/client";
import { api } from "../api";

export interface ElevenLabsSessionCallbacks {
  callerName?: string;
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  onEmergencyTriggered?: (reason: string) => void;
  onStatusChange?: (status: string) => void;
  onError?: (error: unknown) => void;
}

export class ElevenLabsService {
  private activeConversation: any = null;
  private isConnected = false;

  public async startConversation(callbacks: ElevenLabsSessionCallbacks): Promise<boolean> {
    try {
      // 1. Fetch ElevenLabs config from BFF (so user only configures ONE .env!)
      const config = await api.getElevenLabsConfig();
      const signedUrl = config?.signedUrl ?? null;
      const agentId = config?.agentId || import.meta.env.VITE_ELEVENLABS_AGENT_ID;

      if (!signedUrl && !agentId) {
        console.warn("ElevenLabs not configured (no signedUrl and no agentId)");
        return false;
      }

      // 3. Start ElevenLabs session
      const sessionOptions: any = {
        clientTools: {
          trigger_emergency_alert: async (params: { reason?: string; level?: string; keyword?: string }) => {
            const detectedReason = params.reason || params.keyword || "danger_detected";
            callbacks.onEmergencyTriggered?.(detectedReason);
            return { status: "emergency_alert_dispatched" };
          },
        },
        onConnect: () => {
          this.isConnected = true;
          callbacks.onStatusChange?.("connected");
        },
        onDisconnect: () => {
          this.isConnected = false;
          callbacks.onStatusChange?.("disconnected");
        },
        onError: (err: unknown) => {
          console.warn("ElevenLabs conversation error:", err);
          callbacks.onError?.(err);
        },
        onMessage: (data: { message: string; source: "user" | "ai" }) => {
          if (data && data.message) {
            const sender = data.source === "user" ? "Ty" : (callbacks.callerName || "Agent");
            callbacks.onTranscript?.(`${sender}: ${data.message}`, true);
          }
        },
      };

      if (signedUrl) {
        sessionOptions.signedUrl = signedUrl;
      } else {
        sessionOptions.agentId = agentId;
      }

      this.activeConversation = await Conversation.startSession(sessionOptions);
      return true;
    } catch (err) {
      console.warn("Failed to start ElevenLabs session:", err);
      this.isConnected = false;
      this.activeConversation = null;
      return false;
    }
  }

  public async endConversation(): Promise<void> {
    if (this.activeConversation) {
      try {
        await this.activeConversation.endSession();
      } catch (err) {
        console.warn("Error ending ElevenLabs session:", err);
      } finally {
        this.activeConversation = null;
        this.isConnected = false;
      }
    }
  }

  public getIsConnected(): boolean {
    return this.isConnected;
  }
}

export const elevenLabsService = new ElevenLabsService();
