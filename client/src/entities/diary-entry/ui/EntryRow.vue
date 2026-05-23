<script setup lang="ts">
import { Icon } from '@/shared/ui/icon';
import { AppModal } from '@/shared/ui/modal';
import { AppInput } from '@/shared/ui/input';
import { AppButton } from '@/shared/ui/button';
import MobileBottomControls from '@/shared/ui/mobile-bottom-controls/MobileBottomControls.vue';
import { MealSelect } from '@/shared/ui/select';
import type { IDiaryEntry } from '../model/types';
import type { MealType } from '@/shared/config/meals';
import { useBreakpoints } from '@/shared/lib/breakpoints';

const { isMobile } = useBreakpoints();

const props = defineProps<{ entry: IDiaryEntry; compact?: boolean }>();
const emit = defineEmits<{
  (e: 'remove', id: string): void;
  (e: 'update', payload: { id: string; weight: number; mealType: MealType }): void;
}>();

const isOpen = ref(false);
const localWeight = ref<number>(props.entry.weight);
const localMeal = ref<MealType>(props.entry.mealType);

const openModal = () => {
  localWeight.value = props.entry.weight;
  localMeal.value = props.entry.mealType;
  isOpen.value = true;
};

const onSave = () => {
  if (localWeight.value > 0) {
    emit('update', { id: props.entry.id, weight: localWeight.value, mealType: localMeal.value });
    isOpen.value = false;
  }
};

const onRemove = () => {
  emit('remove', props.entry.id);
  isOpen.value = false;
};
</script>

<template>
  <div class="entry-row" :class="{ compact: props.compact }">
    <div class="info-wrap">
      <span class="name">{{ entry.productName }}</span>
      <div class="data-wrap">
        <span class="weight">{{ entry.weight }} г</span>
        <span class="calories">{{ entry.calories }} ккал</span>
        <span class="macros">Б:{{ entry.protein }} Ж:{{ entry.fat }} У:{{ entry.carbs }}</span>
      </div>
    </div>
    <button @click="openModal" class="edit-btn">
      <Icon name="Pencil" size="sm" />
    </button>

    <AppModal v-model="isOpen" :title="entry.productName" max-width="400px">
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
  </div>
</template>

<style scoped>
.entry-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  font-size: 0.9rem;
}
.entry-row:nth-child(even) {
  background-color: #edf1f3;
}
.entry-row:nth-child(odd) {
  background-color: #f9f9f9;
}
.compact {
  justify-content: space-between;
  gap: 8px;
  padding: 4px 8px;
}
.info-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.data-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}
.name {
  flex: 2;
}
.weight {
  flex: 1;
}
.calories {
  flex: 1;
  font-weight: 700;
  font-size: 0.8rem;
}
.macros {
  flex: 2;
}
.edit-btn {
  background: none;
  border: none;
  cursor: pointer;
}
.edit-btn:hover {
  color: rgb(var(--color-darkgreen));
}
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
