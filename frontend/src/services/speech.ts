// Web Speech API interfaces for cross-browser support
interface IWindow extends Window {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
}

export class SpeechService {
  private recognition: any | null = null;
  private isListening = false;
  private onTranscriptCallback: ((transcript: string, isFinal: boolean) => void) | null = null;
  private onKeywordDetectedCallback: ((keyword: string, fullTranscript: string) => void) | null = null;
  private keywords: string[] = [];

  constructor() {
    const win = typeof window !== "undefined" ? (window as unknown as IWindow) : null;
    const SpeechRec = win?.SpeechRecognition || win?.webkitSpeechRecognition;

    if (SpeechRec) {
      this.recognition = new SpeechRec();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = "pl-PL";

      this.recognition.onresult = (event: any) => {
        let currentTranscript = "";
        let isFinal = false;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          currentTranscript += item[0].transcript;
          if (item.isFinal) isFinal = true;
        }

        if (this.onTranscriptCallback) {
          this.onTranscriptCallback(currentTranscript, isFinal);
        }

        this.checkKeywords(currentTranscript);
      };

      this.recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          this.isListening = false;
        }
      };

      this.recognition.onend = () => {
        // Auto-restart if we intended to keep listening during active call
        if (this.isListening) {
          try {
            this.recognition.start();
          } catch {
            // Already started or restarting
          }
        }
      };
    }
  }

  public setKeywords(keywords: string[]) {
    this.keywords = keywords.map((k) => k.trim().toLowerCase());
  }

  public startListening(
    onTranscript: (transcript: string, isFinal: boolean) => void,
    onKeywordDetected: (keyword: string, fullTranscript: string) => void
  ) {
    this.onTranscriptCallback = onTranscript;
    this.onKeywordDetectedCallback = onKeywordDetected;
    this.isListening = true;

    if (this.recognition) {
      try {
        this.recognition.start();
      } catch (err) {
        console.warn("Recognition already started or error:", err);
      }
    }
  }

  public stopListening() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // Ignore stop error
      }
    }
  }

  private checkKeywords(transcript: string) {
    const normalized = transcript.toLowerCase();
    for (const keyword of this.keywords) {
      if (keyword.length > 0 && normalized.includes(keyword)) {
        if (this.onKeywordDetectedCallback) {
          this.onKeywordDetectedCallback(keyword, transcript);
        }
        break;
      }
    }
  }

  public speak(text: string, onEnd?: () => void) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      if (onEnd) setTimeout(onEnd, 1500);
      return;
    }

    // Cancel ongoing speech to avoid overlaps
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pl-PL";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Pick Polish voice if available
    const voices = window.speechSynthesis.getVoices();
    const plVoice = voices.find((v) => v.lang.startsWith("pl"));
    if (plVoice) {
      utterance.voice = plVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
    }

    window.speechSynthesis.speak(utterance);
  }

  public cancelSpeech() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  public isSupported(): boolean {
    return Boolean(this.recognition);
  }
}

export const speechService = new SpeechService();
