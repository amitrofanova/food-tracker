<script setup lang="ts">
import { watch } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    closeOnClickOutside?: boolean;
    showCloseButton?: boolean;
    blur?: boolean;
    width?: string;
    maxWidth?: string;
    transitionName?: string;
  }>(),
  {
    closeOnClickOutside: true,
    showCloseButton: true,
    blur: true,
    width: 'auto',
    maxWidth: '90vw',
    transitionName: 'modal-fade',
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'closed'): void;
}>();

const close = () => {
  emit('update:modelValue', false);
};

const handleOverlayClick = () => {
  if (props.closeOnClickOutside) {
    close();
  }
};

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  },
  { immediate: true },
);
</script>

<template>
  <Teleport to="body">
    <Transition appear :name="transitionName" @after-leave="emit('closed')">
      <div
        v-if="modelValue"
        class="modal-overlay"
        :class="{ 'modal-overlay-blur': blur }"
        @click.self="handleOverlayClick"
      >
        <div class="modal-container" :style="{ width, maxWidth }">
          <button v-if="showCloseButton" class="modal-close" @click="close" aria-label="Закрыть">
            ✕
          </button>
          <div class="modal-content">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-overlay-blur {
  backdrop-filter: blur(4px);
}

.modal-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  z-index: 10;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.1);
}

.modal-content {
  padding: 24px;
}

/* Анимации */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-container,
.modal-fade-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-fade-enter-from .modal-container,
.modal-fade-leave-to .modal-container {
  transform: scale(0.9);
}
</style>
