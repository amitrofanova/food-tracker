<script setup lang="ts">
export interface MobileBottomButton {
  label: string;
  event: string;
  color?: string;
  disabled?: boolean;
}

defineProps<{
  buttons: MobileBottomButton[];
}>();

const emit = defineEmits<{ [key: string]: [] }>();

const barRef = ref<HTMLElement | null>(null);

onMounted(() => {
  if (barRef.value) {
    const h = barRef.value.offsetHeight;
    document.documentElement.style.setProperty('--mobile-bottom-bar-height', `${h}px`);
  }
});

onUnmounted(() => {
  document.documentElement.style.removeProperty('--mobile-bottom-bar-height');
});
</script>

<template>
  <div ref="barRef" class="bottom-bar">
    <slot>
      <button
        v-for="btn in buttons"
        :key="btn.event"
        class="btn"
        :style="{ backgroundColor: btn.color ?? 'rgb(var(--color-darkgreen))' }"
        :disabled="btn.disabled"
        @click="emit(btn.event)"
      >
        {{ btn.label }}
      </button>
    </slot>
  </div>
</template>

<style scoped>
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background-color: rgb(var(--bg-primary));
  border-top: 1px solid rgba(var(--color-gray), 0.2);
  z-index: 100;
}

.btn {
  flex: 1;
  appearance: none;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  border-radius: var(--border-radius);
  padding: 10px 16px;
  color: #fff;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: opacity 0.2s ease-in-out;
}

.btn:hover {
  opacity: 0.9;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
