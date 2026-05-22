<script setup lang="ts">
const props = defineProps<{
  value: number;
  max: number;
}>();

const greenWidth = computed(() => {
  if (!props.max) return 0;
  if (props.value <= props.max) return (props.value / props.max) * 100;
  return (props.max / props.value) * 100;
});

const redWidth = computed(() => {
  if (!props.max || props.value <= props.max) return 0;
  return ((props.value - props.max) / props.value) * 100;
});
</script>

<template>
  <div class="progress-track">
    <div class="progress-fill progress-fill_green" :style="{ width: `${greenWidth}%` }"></div>
    <div
      v-if="redWidth > 0"
      class="progress-fill progress-fill_red"
      :style="{ width: `${redWidth}%` }"
    ></div>
  </div>
</template>

<style scoped>
.progress-track {
  width: 100%;
  height: 8px;
  background-color: rgba(var(--color-gray), 0.3);
  border-radius: 4px;
  overflow: hidden;
  display: flex;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
  flex-shrink: 0;
}

.progress-fill_green {
  background-color: rgb(var(--color-darkgreen));
}

.progress-fill_red {
  background-color: rgb(var(--color-red));
}
</style>
