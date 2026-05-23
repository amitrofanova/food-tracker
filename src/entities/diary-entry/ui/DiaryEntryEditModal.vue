<script setup lang="ts">
import { AppModal } from '@/shared/ui/modal';
import { AppInput } from '@/shared/ui/input';
import { AppButton } from '@/shared/ui/button';
import { MobileBottomControls } from '@/shared/ui/mobile-bottom-controls';
import { MealSelect } from '@/shared/ui/select';
import { Icon } from '@/shared/ui/icon';
import type { IDiaryEntry } from '../model/types';
import type { MealType } from '@/shared/config/meals';
import { useBreakpoints } from '@/shared/lib/breakpoints';

const props = defineProps<{
  modelValue: boolean;
  entry: IDiaryEntry;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'update', payload: { id: string; weight: number; mealType: MealType }): void;
  (e: 'remove', id: string): void;
}>();

const { isMobile } = useBreakpoints();

const localWeight = ref<number>(props.entry.weight);
const localMeal = ref<MealType>(props.entry.mealType);

// Reset local state to entry values each time the modal opens.
watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      localWeight.value = props.entry.weight;
      localMeal.value = props.entry.mealType;
    }
  },
);

const onSave = () => {
  if (localWeight.value > 0) {
    emit('update', { id: props.entry.id, weight: localWeight.value, mealType: localMeal.value });
    emit('update:modelValue', false);
  }
};

const onRemove = () => {
  emit('remove', props.entry.id);
  emit('update:modelValue', false);
};
</script>

<template>
  <AppModal
    :model-value="modelValue"
    :title="entry.productName"
    max-width="400px"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="edit-modal">
      <AppInput label="Вес (г)" type="number" v-model="localWeight" />
      <div class="edit-modal__actions">
        <MealSelect v-model="localMeal" />
        <AppButton color="rgb(var(--color-red))" @click="onRemove">
          <Icon name="Trash" size="sm" />
          Удалить запись
        </AppButton>
      </div>
      <MobileBottomControls
        v-if="isMobile"
        :buttons="[{ label: 'Сохранить', event: 'save' }]"
        @save="onSave"
      />
      <AppButton v-else @click="onSave">Сохранить</AppButton>
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
