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

type RGB = [r: number, g: number, b: number];

const toRgbTuple = (values: number[]): RGB | null => {
  const [r, g, b] = values;
  if (r === undefined || g === undefined || b === undefined) return null;
  if ([r, g, b].some((value) => Number.isNaN(value))) return null;

  return [r, g, b];
};

const parseRgbFromColor = (color: string): RGB | null => {
  if (color.startsWith('rgb(var(')) {
    const varMatch = color.match(/var\((--[^)]+)\)/);
    const varName = varMatch?.[1];
    if (!varName) return null;

    const value = getComputedStyle(document.documentElement).getPropertyValue(varName);
    return toRgbTuple(value.split(',').map((segment) => parseInt(segment.trim(), 10)));
  }

  const numericParts = color.match(/\d+/g)?.map(Number) ?? [];
  return toRgbTuple(numericParts);
};

const textColor = computed(() => {
  const rgb = parseRgbFromColor(props.color);
  if (!rgb) return '#fff';

  const [r, g, b] = rgb;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 185 ? '#000' : '#fff';
});
</script>

<template>
  <button :class="`btn btn_${size}`" :style="{ backgroundColor: color, color: textColor }">
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
.btn_sm {
  padding: 8px 12px;
  font-size: 0.9em;
}
.btn_md {
  padding: 10px 16px;
}
.btn_lg {
  padding: 12px 20px;
  font-size: 1.1em;
}
</style>
