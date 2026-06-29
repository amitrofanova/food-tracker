<script setup lang="ts">
import { Icon } from '@/shared/ui/icon';
import { useDiaryStore } from '@/entities/diary-entry';
import type { IProduct } from '@/entities/product';
import type { MealType } from '@/shared/config/meals';
import { useVoiceInput } from '@/shared/lib/voice/useVoiceInput';
import { useParseVoiceIntent, type VoiceIntent } from '@/shared/lib/voice/useParseVoiceIntent';
import VoiceConfirmModal from './VoiceConfirmModal.vue';
import { useBreakpoints } from '@/shared/lib/breakpoints';

const { isDesktop } = useBreakpoints();
const diaryStore = useDiaryStore();

const { state, error: voiceError, listen } = useVoiceInput();
const { parse, isLoading: isParsing, error: parseError } = useParseVoiceIntent();

const voiceIntent = ref<VoiceIntent | null>(null);
const confirmOpen = ref(false);

const isListening = computed(() => state.value === 'listening');
const isBusy = computed(() => isListening.value || isParsing.value);
const statusError = computed(() => voiceError.value || parseError.value);

const statusText = computed(() => {
  if (isListening.value) return 'Слушаю...';
  if (isParsing.value) return 'Распознаю...';
  if (statusError.value) return statusError.value;
  return isDesktop.value ? 'Скажите, что добавить к дневнику' : '';
});

const isExpanded = computed(() => !!statusText.value);

const dismissError = () => {
  voiceError.value = null;
  parseError.value = null;
};

const onClick = async () => {
  if (statusError.value) {
    dismissError();
    return;
  }
  if (isBusy.value) return;

  const transcript = await listen();
  if (!transcript) return;

  const intent = await parse(transcript);
  if (!intent?.productName) return;

  voiceIntent.value = intent;
  confirmOpen.value = true;
};

watch(confirmOpen, (open) => {
  if (!open) voiceIntent.value = null;
});

const onConfirm = (product: IProduct, weight: number, meal: MealType) => {
  diaryStore.addEntry(product, weight, meal);
  voiceIntent.value = null;
};
</script>

<template>
  <div>
    <button
      class="voice-btn"
      :class="{
        'voice-btn--expanded': isExpanded,
        'voice-btn--listening': isListening,
        'voice-btn--parsing': isParsing,
        'voice-btn--error': !!statusError,
        'voice-btn--busy': isBusy,
      }"
      :disabled="isBusy && !statusError"
      :aria-label="isExpanded ? statusText : 'Голосовой ввод'"
      :aria-busy="isBusy"
      @click="onClick"
    >
      <Icon name="Mic" class="voice-btn__icon" />
      <Transition name="voice-text">
        <span v-if="isExpanded" class="voice-btn__text">{{ statusText }}</span>
      </Transition>
    </button>
    <VoiceConfirmModal v-model="confirmOpen" :intent="voiceIntent" @confirm="onConfirm" />
  </div>
</template>

<style scoped>
.voice-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 50px;
  min-width: 50px;
  max-width: 50px;
  border-radius: 50%;
  padding: 0 8px;
  overflow: hidden;
  white-space: nowrap;
  border: none;
  cursor: pointer;
  background-color: rgba(var(--color-darkgreen), 0.95);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.35);
  color: white;
  transition:
    max-width 0.35s ease,
    background-color 0.25s,
    color 0.25s;
  user-select: none;
}

@media (min-width: 768px) {
  .voice-btn {
    height: 40px;
    min-width: 40px;
    max-width: 40px;
    border-radius: 20px;
    background-color: rgb(var(--color-warm));
    color: rgb(var(--color-darkgreen));
    box-shadow: 0 0 4px rgb(var(--color-darkgreen));
  }
}
.voice-btn:hover:not(:disabled) {
  background-color: rgba(var(--color-darkgreen), 0.05);
}

.voice-btn:disabled {
  cursor: default;
}

.voice-btn--expanded {
  max-width: 280px;
}

.voice-btn--listening {
  animation: mic-pulse 1.2s ease-in-out infinite;
}

/* .voice-btn--parsing {
  background-color: rgb(var(--color-darkgreen));
}
 */
.voice-btn--error {
  background-color: rgb(var(--bg-warm));
  color: rgb(var(--color-red));
}

.voice-btn__icon {
  flex-shrink: 0;
}

.voice-btn__text {
  padding-right: 8px;
  font-size: 0.82rem;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
}

.voice-text-enter-active {
  transition: opacity 0.2s ease 0.15s;
}

.voice-text-leave-active {
  transition: opacity 0.1s ease;
}

.voice-text-enter-from,
.voice-text-leave-to {
  opacity: 0;
}

@keyframes mic-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.9;
  }
}
</style>
