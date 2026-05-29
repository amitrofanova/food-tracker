<script setup lang="ts">
import { AppModal } from '@/shared/ui/modal';
import { AppInput } from '@/shared/ui/input';
import { AppButton } from '@/shared/ui/button';
import { MobileBottomControls } from '@/shared/ui/mobile-bottom-controls';
import { Icon } from '@/shared/ui/icon';
import type { IRecipeIngredient } from '../model/types';
import { useBreakpoints } from '@/shared/lib/breakpoints';

const props = defineProps<{
  modelValue: boolean;
  ingredient: IRecipeIngredient;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'update', payload: { productId: string; weight: number }): void;
  (e: 'remove', productId: string): void;
}>();

const { isMobile } = useBreakpoints();

const localWeight = ref<number>(props.ingredient.weight);

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      localWeight.value = props.ingredient.weight;
    }
  },
);

const onSave = () => {
  if (localWeight.value > 0) {
    emit('update', { productId: props.ingredient.productId, weight: localWeight.value });
    emit('update:modelValue', false);
  }
};

const onRemove = () => {
  emit('remove', props.ingredient.productId);
  emit('update:modelValue', false);
};
</script>

<template>
  <AppModal
    :model-value="modelValue"
    :title="ingredient.productName"
    max-width="400px"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="edit-modal">
      <AppInput label="Вес (г)" type="number" v-model="localWeight" />
      <MobileBottomControls
        v-if="isMobile"
        :buttons="[
          { label: 'Сохранить', event: 'save' },
          { label: 'Удалить', event: 'remove', color: 'rgb(var(--color-red))' },
        ]"
        @save="onSave"
        @remove="onRemove"
      />
      <template v-else>
        <AppButton color="rgb(var(--color-red))" @click="onRemove">
          <Icon name="Trash" size="sm" />
          Удалить ингредиент
        </AppButton>
        <AppButton @click="onSave">Сохранить</AppButton>
      </template>
    </div>
  </AppModal>
</template>

<style scoped>
.edit-modal {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 0.5rem;
}
.edit-modal__actions {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}
</style>
