import { SpeechRecognition } from "@capacitor-community/speech-recognition";
import { Capacitor } from "@capacitor/core";

interface WebSpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
}

declare global {
  interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
  }
  interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
    readonly message: string;
  }
  interface Window {
    SpeechRecognition?: new () => WebSpeechRecognition;
    webkitSpeechRecognition?: new () => WebSpeechRecognition;
  }
}

export type VoiceInputState = "idle" | "listening" | "error";

function uniqueTranscripts(values: Array<string | undefined | null>): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const trimmed = value?.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }
  return result;
}

export function useVoiceInput() {
  const state = ref<VoiceInputState>("idle");
  const error = ref<string | null>(null);
  const isNative = Capacitor.isNativePlatform();

  const stop = () => {
    if (isNative) SpeechRecognition.stop();
    state.value = "idle";
  };

  async function _listenNative(): Promise<string[] | null> {
    try {
      const { speechRecognition } = await SpeechRecognition.requestPermissions();
      if (speechRecognition !== "granted") {
        error.value = "Нет разрешения на распознавание речи";
        state.value = "idle";
        return null;
      }

      const startOpts = { language: "ru-RU", maxResults: 3, popup: false, partialResults: false };

      let matches: string[] | undefined;
      try {
        ({ matches } = await SpeechRecognition.start(startOpts));
      } catch {
        // First attempt often fails on Android while the recognition service is still
        // binding — retry once silently before surfacing the error to the user.
        ({ matches } = await SpeechRecognition.start(startOpts));
      }

      state.value = "idle";
      const transcripts = uniqueTranscripts(matches ?? []);
      return transcripts.length > 0 ? transcripts : null;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Ошибка распознавания речи";
      state.value = "error";
      return null;
    }
  }

  function _listenWeb(): Promise<string[] | null> {
    return new Promise((resolve) => {
      const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
      if (!Ctor) {
        error.value = "Голосовой ввод не поддерживается в этом браузере";
        state.value = "error";
        resolve(null);
        return;
      }

      const recognition = new Ctor();
      recognition.lang = "ru-RU";
      recognition.interimResults = false;
      recognition.maxAlternatives = 3;

      recognition.onresult = (e: SpeechRecognitionEvent) => {
        const result = e.results[0];
        const alts: string[] = [];
        if (result) {
          for (let i = 0; i < result.length; i += 1) {
            alts.push(result[i]?.transcript ?? "");
          }
        }
        state.value = "idle";
        const transcripts = uniqueTranscripts(alts);
        resolve(transcripts.length > 0 ? transcripts : null);
      };

      recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
        error.value = e.error ?? "Ошибка микрофона";
        state.value = "error";
        resolve(null);
      };

      recognition.onend = () => {
        if (state.value === "listening") {
          state.value = "idle";
          resolve(null);
        }
      };

      recognition.start();
    });
  }

  const listen = (): Promise<string[] | null> => {
    error.value = null;
    state.value = "listening";

    if (isNative) {
      return _listenNative();
    }
    return _listenWeb();
  };

  return { state, error, listen, stop };
}
