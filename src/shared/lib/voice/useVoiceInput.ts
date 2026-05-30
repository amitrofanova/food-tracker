import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { Capacitor } from '@capacitor/core';

export type VoiceInputState = 'idle' | 'listening' | 'error';

export function useVoiceInput() {
  const state = ref<VoiceInputState>('idle');
  const error = ref<string | null>(null);
  const isNative = Capacitor.isNativePlatform();

  const stop = () => {
    if (isNative) SpeechRecognition.stop();
    state.value = 'idle';
  };

  async function _listenNative(): Promise<string | null> {
    try {
      const { speechRecognition } = await SpeechRecognition.requestPermissions();
      if (speechRecognition !== 'granted') {
        error.value = 'Нет разрешения на распознавание речи';
        state.value = 'idle';
        return null;
      }

      const { matches } = await SpeechRecognition.start({
        language: 'ru-RU',
        maxResults: 1,
        popup: false,
        partialResults: false,
      });
      state.value = 'idle';
      return matches?.[0] ?? null;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Ошибка распознавания речи';
      state.value = 'error';
      return null;
    }
  }

  function _listenWeb(): Promise<string | null> {
    return new Promise((resolve) => {
      const Ctor = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
      if (!Ctor) {
        error.value = 'Голосовой ввод не поддерживается в этом браузере';
        state.value = 'error';
        resolve(null);
        return;
      }

      const recognition = new Ctor();
      recognition.lang = 'ru-RU';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (e: any) => {
        const text = e.results[0][0].transcript as string;
        state.value = 'idle';
        resolve(text);
      };

      recognition.onerror = (e: any) => {
        error.value = e.error ?? 'Ошибка микрофона';
        state.value = 'error';
        resolve(null);
      };

      recognition.onend = () => {
        if (state.value === 'listening') {
          state.value = 'idle';
          resolve(null);
        }
      };

      recognition.start();
    });
  }

  const listen = (): Promise<string | null> => {
    error.value = null;
    state.value = 'listening';

    if (isNative) {
      return _listenNative();
    }
    return _listenWeb();
  };

  return { state, error, listen, stop };
}
