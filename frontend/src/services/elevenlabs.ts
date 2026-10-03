import { Conversation } from "@elevenlabs/client";
import { api } from "../api";

export interface ElevenLabsSessionCallbacks {
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
      // 1. Try to get signed URL from BFF (preferred, keeps ELEVENLABS_API_KEY secure on backend)
      let signedUrl: string | null = null;
      try {
        signedUrl = await api.getElevenLabsSignedUrl();
      } catch {
        signedUrl = null;
      }

      // 2. Fallback to public agent ID from Vite env if signed URL is not configured
      const publicAgentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID;

      if (!signedUrl && !publicAgentId) {
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
            callbacks.onTranscript?.(`${data.source === "user" ? "Ty" : "Mama"}: ${data.message}`, true);
          }
        },
      };

      if (signedUrl) {
        sessionOptions.signedUrl = signedUrl;
      } else {
        sessionOptions.agentId = publicAgentId;
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
