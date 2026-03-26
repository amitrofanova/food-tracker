<script setup lang="ts">
import { defineAsyncComponent, computed } from 'vue';

const props = defineProps<{
  name: string;
  size?: 'sm' | 'md' | 'lg' | number;
}>();

const modules = import.meta.glob('./icons/*.vue');

const iconComponent = computed(() => {
  const path = `./icons/${props.name}.vue`;
  if (modules[path]) {
    return defineAsyncComponent(modules[path] as any);
  }
  console.warn(`Icon "${props.name}" not found`);
  return null;
});

const sizeClass = computed(() => {
  if (typeof props.size === 'string') {
    return `icon_${props.size}`;
  }
  return '';
});
</script>

<template>
  <component :is="iconComponent" v-bind="$attrs" class="icon" :class="sizeClass" />
</template>

<style scoped>
.icon {
  display: inline-block;
  flex-shrink: 0;
  vertical-align: middle;
  fill: currentColor;
}
.icon_sm {
  font-size: 1rem;
}
.icon_md {
  font-size: 1.5rem;
}
.icon_lg {
  font-size: 2rem;
}
</style>
