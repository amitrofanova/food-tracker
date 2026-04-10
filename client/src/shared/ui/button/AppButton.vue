<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    color?: string;
    size?: 'sm' | 'md' | 'lg';
  }>(),
  {
    color: 'rgb(var(--color-secondary))',
    size: 'md',
  },
);

const textColor = computed(() => {
  let rgb: number[] | undefined;

  if (props.color.startsWith('rgb(var(')) {
    const varMatch = props.color.match(/var\((--[^)]+)\)/);
    if (varMatch && varMatch[1]) {
      const varName = varMatch[1];
      const value = getComputedStyle(document.documentElement).getPropertyValue(varName);
      rgb = value.split(',').map((s) => parseInt(s.trim()));
    }
  } else {
    rgb = props.color.match(/\d+/g)?.map(Number);
  }

  if (!rgb || rgb.length < 3 || rgb.some((v) => isNaN(v))) return '#fff';
  const [r, g, b] = rgb as [number, number, number];
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 185 ? '#000' : '#fff';
});
</script>

<template>
  <button
    :class="`btn btn--${size}`"
    :style="{ backgroundColor: color, color: textColor }"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>

<style scoped>
.btn {
  appearance: none;
  display: flex;
  gap: 6px;
  justify-content: center;
  align-items: center;
  border: none;
  border-radius: var(--border-radius);
  padding: 10px 16px;
  color: #fff;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s ease-in-out 0.1s;
}
.btn:hover {
  opacity: 0.9;
}
.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.btn--sm {
  padding: 8px 12px;
  font-size: 0.9em;
}
.btn--md {
  padding: 10px 16px;
}
.btn--lg {
  padding: 12px 20px;
  font-size: 1.1em;
}
</style>
