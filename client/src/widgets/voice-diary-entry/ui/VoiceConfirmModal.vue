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

const isDirectAdd = computed(() => (props.intent?.calories ?? null) !== null);
// true when the user didn't mention weight (calories are an absolute total for the dish)
const isTotalCalories = computed(() => isDirectAdd.value && props.intent?.weight === null);

watch(
  () => props.intent,
  (intent) => {
    if (intent) {
      weight.value = intent.weight ?? 100;
      meal.value = intent.meal;
      if (!intent.calories) {
        nextTick(() => productSearchRef.value?.setQuery(intent.productName));
      }
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

const onDirectConfirm = () => {
  const intent = props.intent!;
  const w = Math.max(1, weight.value);
  // AI returns totals for the given portion; convert to per-100g for the product
  const factor = 100 / w;
  const product: IProduct = {
    id: `voice_${Date.now()}`,
    name: intent.productName,
    calories: Math.round((intent.calories ?? 0) * factor),
    protein: Math.round((intent.protein ?? 0) * factor),
    fat: Math.round((intent.fat ?? 0) * factor),
    carbs: Math.round((intent.carbs ?? 0) * factor),
  };
  emit('confirm', product, w, meal.value);
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

    <!-- Direct-add: calories were provided in voice command -->
    <template v-if="isDirectAdd">
      <div class="vc-direct">
        <p class="vc-direct__name">{{ intent?.productName }}</p>
        <ul class="vc-direct__macros">
          <li>
            <strong>{{ intent?.calories }}</strong> ккал
          </li>
          <li v-if="intent?.protein !== null">
            Белки: <strong>{{ intent?.protein }}</strong> г
          </li>
          <li v-if="intent?.fat !== null">
            Жиры: <strong>{{ intent?.fat }}</strong> г
          </li>
          <li v-if="intent?.carbs !== null">
            Углеводы: <strong>{{ intent?.carbs }}</strong> г
          </li>
        </ul>
        <p class="vc-direct__hint">
          {{
            isTotalCalories ? 'Итого для порции' : `Значения указаны для ${intent?.weight}\u00a0г`
          }}
        </p>
      </div>
      <button class="vc-confirm-btn" @click="onDirectConfirm">Добавить</button>
    </template>

    <!-- Normal flow: search for a product -->
    <template v-else>
      <div class="vc-search">
        <ProductSearch
          ref="productSearchRef"
          :suggested-weight="weight"
          @select="onProductSelect"
        />
      </div>
    </template>
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
.vc-direct {
  padding: 0.5rem 0 1rem;
}
.vc-direct__name {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}
.vc-direct__macros {
  list-style: none;
  padding: 0;
  margin: 0 0 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  font-size: 0.9rem;
}
.vc-direct__hint {
  font-size: 0.8rem;
  color: var(--color-text-secondary, #888);
}
.vc-confirm-btn {
  display: block;
  width: 100%;
  padding: 0.65rem;
  border: none;
  border-radius: 8px;
  background: var(--color-primary, #4caf50);
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
}
.vc-confirm-btn:hover {
  opacity: 0.9;
}
</style>
