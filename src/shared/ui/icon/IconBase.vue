<script setup lang="ts">
const SIZE_MAP = {
  sm: 16,
  md: 24,
  lg: 32,
} as const;

type IconSize = keyof typeof SIZE_MAP;

interface Props {
  name: string;
  size?: IconSize | number;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
});

const iconStyle = computed(() => {
  let size: number;

  if (typeof props.size === 'number') {
    size = props.size;
  } else if (props.size && props.size in SIZE_MAP) {
    size = SIZE_MAP[props.size as IconSize];
  } else {
    size = SIZE_MAP.md;
  }

  return {
    width: `${size}px`,
    height: `${size}px`,
  };
});

const modules = import.meta.glob('./icons/*.vue');

const iconComponent = computed(() => {
  const path = `./icons/${props.name}.vue`;
  if (modules[path]) {
    return defineAsyncComponent(modules[path] as any);
  }
  console.warn(`Icon "${props.name}" not found`);
  return null;
});
</script>

<template>
  <component :is="iconComponent" v-bind="$attrs" class="icon" :style="iconStyle" />
</template>

<style scoped>
.icon {
  display: inline-block;
  flex-shrink: 0;
  width: 1em;
  height: 1em;
  vertical-align: middle;
  fill: currentColor;
  stroke: currentColor;
}
.icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
