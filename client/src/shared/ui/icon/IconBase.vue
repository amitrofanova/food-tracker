<script setup lang="ts">
import { icons, type IconName, type IconSize } from "./registry";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    name: IconName;
    size?: IconSize;
    /** CSS-цвет глифа. Без prop иконка наследует currentColor родителя. */
    color?: string;
    /**
     * Доступное имя, если смысл несёт сама иконка.
     * Без label иконка декоративная и скрыта от скринридера.
     * У кнопки без текста имя задаётся на <button> через aria-label.
     */
    label?: string;
  }>(),
  {
    size: "md",
  },
);

const attrs = useAttrs();

const iconStyle = computed(() => (props.color ? { color: props.color } : undefined));
</script>

<template>
  <component
    :is="icons[name]"
    v-bind="attrs"
    class="icon"
    :class="`icon_${size}`"
    :style="iconStyle"
    focusable="false"
    :role="label ? 'img' : undefined"
    :aria-label="label || undefined"
    :aria-hidden="label ? undefined : true"
  />
</template>

<style scoped>
.icon {
  display: inline-block;
  flex-shrink: 0;
  vertical-align: middle;
  fill: currentColor;
  stroke: currentColor;
}
.icon_sm {
  width: 16px;
  height: 16px;
}
.icon_md {
  width: 24px;
  height: 24px;
}
.icon_lg {
  width: 32px;
  height: 32px;
}
.icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
