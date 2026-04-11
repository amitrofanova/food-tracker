<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    label: string;
    modelValue: string | number;
    type?: string;
    placeholder?: string;
    error?: string;
    disabled?: boolean;
  }>(),
  {
    type: 'text',
    placeholder: '',
    error: '',
    disabled: false,
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void;
  (e: 'input'): void;
}>();

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = props.type === 'number' ? target.value : target.value;
  emit('update:modelValue', value);
  emit('input');
};
</script>

<template>
  <div class="input-field">
    <label :for="label.toLowerCase().replace(/\s+/g, '-')">{{ label }}</label>
    <input
      :id="label.toLowerCase().replace(/\s+/g, '-')"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      class="input"
      @input="handleInput"
    />
    <span v-if="error" class="error">{{ error }}</span>
  </div>
</template>

<style scoped>
.input-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

label {
  font-size: 0.95em;
  font-weight: 500;
  color: #333;
}

.input {
  padding: 8px;
  border: 1px solid #cbd5e0;
  border-radius: 4px;
  width: 100%;
  box-sizing: border-box;
  font-size: 1em;
  transition: border-color 0.2s ease-in-out;
}

.input:focus {
  outline: none;
  border-color: rgb(var(--color-secondary));
}

.input:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error {
  color: rgb(var(--color-red));
  font-size: 0.85em;
  min-height: 1.2em;
}
</style>
