<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    label?: string;
    modelValue: string | number | null | undefined;
    type?: string;
    placeholder?: string;
    error?: string;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
  }>(),
  {
    label: '',
    type: 'text',
    placeholder: '',
    error: '',
    disabled: false,
    size: 'md',
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void;
  (e: 'input'): void;
}>();

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = props.type === 'number' ? Number(target.value) : target.value;
  emit('update:modelValue', value);
  emit('input');
};
</script>

<template>
  <div class="input-field">
    <label v-if="label" :for="label.toLowerCase().replace(/\s+/g, '-')">{{ label }}</label>
    <input
      :id="label ? label.toLowerCase().replace(/\s+/g, '-') : undefined"
      :type="type"
      :value="modelValue ?? ''"
      :placeholder="placeholder"
      :disabled="disabled"
      class="input"
      :class="`input_${size}`"
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
  border: 1px solid #cbd5e0;
  border-radius: var(--border-radius);
  width: 100%;
  box-sizing: border-box;
  font-size: 1em;
  transition: border-color 0.2s ease-in-out;
}

.input_sm {
  height: 30px;
  padding: 0 8px;
  font-size: 0.9em;
}

.input_md {
  height: 40px;
  padding: 0 10px;
}

.input_lg {
  height: 50px;
  padding: 0 12px;
  font-size: 1.05em;
}

.input:focus {
  outline: none;
  border-color: rgb(var(--color-gray));
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
