<script setup lang="ts">
import { watch } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    closeOnClickOutside?: boolean;
    showCloseButton?: boolean;
    width?: string;
    maxWidth?: string;
    transitionName?: string;
  }>(),
  {
    closeOnClickOutside: true,
    showCloseButton: true,
    width: 'auto',
    maxWidth: '100vw',
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
      <div v-if="modelValue" class="modal-overlay" @click.self="handleOverlayClick">
        <div class="modal-container" :style="{ width, maxWidth }">
          <button v-if="showCloseButton" class="modal-close" @click="close" aria-label="Закрыть">
            <span>✕</span>
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
  display: grid;
  place-items: center;
  backdrop-filter: blur(4px);
  z-index: 100;
}
.modal-container {
  width: 100vw;
  height: 100vh;
  background: white;
}
@media (min-width: 768px) {
  .modal-container {
    width: auto;
    height: auto;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    position: relative;
    overflow-y: auto;
  }
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
  display: grid;
  place-items: center;
  transition: background 0.2s;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.1);
}

.modal-content {
  padding: 24px;
}

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
