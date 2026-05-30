<script setup lang="ts">
import type { IProduct } from '@/entities/product';
import type { MealType } from '@/shared/config/meals';
import type { VoiceIntent } from '@/shared/lib/voice/useParseVoiceIntent';
import { ProductSearch } from '@/features/product-search';
import { AppModal } from '@/shared/ui/modal';
import { AppInput } from '@/shared/ui/input';
import { MealSelect } from '@/shared/ui/select';

const props = defineProps<{
  modelValue: boolean;
  intent: VoiceIntent | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'confirm', product: IProduct, weight: number, meal: MealType): void;
}>();

const productSearchRef = ref<InstanceType<typeof ProductSearch> | null>(null);
const weight = ref(100);
const meal = ref<MealType>('breakfast');

watch(
  () => props.intent,
  (intent) => {
    if (intent) {
      weight.value = intent.weight;
      meal.value = intent.meal;
      nextTick(() => productSearchRef.value?.setQuery(intent.productName));
    }
  },
  { immediate: true },
);

watch(
  () => props.modelValue,
  (open) => {
    if (!open) productSearchRef.value?.clearSearch();
  },
);

const onProductSelect = (product: IProduct, rowWeight: number) => {
  emit('confirm', product, rowWeight, meal.value);
  emit('update:modelValue', false);
};
</script>

<template>
  <AppModal
    :model-value="modelValue"
    title="Добавить в дневник"
    width="600px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="vc-meta">
      <AppInput v-model="weight" type="number" label="Граммы" size="sm" class="vc-weight" />
      <MealSelect v-model="meal" class="vc-meal" />
    </div>
    <div class="vc-search">
      <ProductSearch ref="productSearchRef" :suggested-weight="weight" @select="onProductSelect" />
    </div>
  </AppModal>
</template>

<style scoped>
.vc-meta {
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
  margin-bottom: 1rem;
}
.vc-weight {
  width: 7rem;
}
.vc-meal {
  flex: 1;
}
.vc-search {
  display: flex;
  flex-direction: column;
  height: calc(100dvh - 120px);
  min-height: 200px;
}
</style>
