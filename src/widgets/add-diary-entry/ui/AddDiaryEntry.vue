<script setup lang="ts">
import type { IProduct } from '@/entities/product';
import type { IRecipe } from '@/entities/recipe';
import { useDiaryStore, EntryRow } from '@/entities/diary-entry';
import { storeToRefs } from 'pinia';
import { useBreakpoints } from '@/shared/lib/breakpoints';
import type { MealType } from '@/shared/config/meals';
import { CreateProductModal } from '@/features/create-product';
import { ProductSearch } from '@/features/product-search';
import { RecipeFormModal } from '@/widgets/recipe-form';
import { useRecipes } from '@/features/create-recipe';
import { AppButton } from '@/shared/ui/button';
import { ButtonIcon } from '@/shared/ui/button';
import { MealSelect } from '@/shared/ui/select';
import { MobileBottomControls } from '@/shared/ui/mobile-bottom-controls';
import { useVoiceInput } from '@/shared/lib/voice/useVoiceInput';
import { useParseVoiceIntent, type VoiceIntent } from '@/shared/lib/voice/useParseVoiceIntent';
import VoiceConfirmModal from './VoiceConfirmModal.vue';

const diaryStore = useDiaryStore();
const { entriesByMeal } = storeToRefs(diaryStore);
const { save } = useRecipes();
const { isMobile, isDesktop } = useBreakpoints();
const props = defineProps<{ mealType?: MealType }>();
const selectedMeal = ref<MealType>(props.mealType || 'breakfast');
const productModal = ref(false);
const showRecipesModal = ref(false);

const productSearchRef = ref<InstanceType<typeof ProductSearch> | null>(null);
const voiceIntent = ref<VoiceIntent | null>(null);
const voiceModalOpen = ref(false);

const { state: voiceState, error: voiceError, listen } = useVoiceInput();
const { parse, isLoading: isParsing, error: parseError } = useParseVoiceIntent();

const voiceBusy = computed(() => voiceState.value === 'listening' || isParsing.value);
const voiceStatusError = computed(() => voiceError.value || parseError.value);

const onVoiceClick = async () => {
  if (voiceBusy.value) return;
  voiceIntent.value = null;
  const transcript = await listen();
  if (!transcript) return;
  const intent = await parse(transcript, selectedMeal.value);
  if (!intent || !intent.productName) return;
  voiceIntent.value = intent;
  selectedMeal.value = intent.meal;
  voiceModalOpen.value = true;
};

const clearVoiceIntent = () => {
  voiceIntent.value = null;
};

const onVoiceConfirm = (product: IProduct, weight: number, meal: MealType) => {
  diaryStore.addEntry(product, weight, meal);
  voiceIntent.value = null;
};

const onProductSelect = (product: IProduct, weight: number) => {
  diaryStore.addEntry(product, weight, selectedMeal.value);
};

const onSaved = async (recipe: IRecipe) => {
  await save(recipe);
};

const mobileButtons = computed(() => [
  { label: 'Новый продукт', event: 'new-product' },
  { label: 'Новый рецепт', event: 'new-recipe' },
  {
    label: '🎤',
    event: 'voice',
    color: voiceState.value === 'listening' ? 'rgb(var(--color-red))' : undefined,
  },
]);
</script>

<template>
  <div class="add-entry-wrap">
    <div v-if="isDesktop" class="controls">
      <MealSelect v-model="selectedMeal" class="meal-select" />
      <ButtonIcon
        name="Mic"
        :class="{ 'btn-mic--active': voiceState === 'listening', 'btn-mic--busy': voiceBusy }"
        class="btn-mic"
        :disabled="voiceBusy"
        aria-label="Голосовой ввод"
        @click="onVoiceClick"
      />
      <AppButton class="btn-recipes" @click="showRecipesModal = true"> Свой рецепт </AppButton>
      <AppButton @click="productModal = true" class="btn-create"> Свой продукт </AppButton>
    </div>
    <CreateProductModal
      v-model="productModal"
      :default-meal="selectedMeal"
      @add-entry="(p, w, m) => diaryStore.addEntry(p, w, m)"
    />
    <RecipeFormModal
      v-model="showRecipesModal"
      title="Создать рецепт"
      :default-meal="selectedMeal"
      @saved="onSaved"
      @added="showRecipesModal = false"
    />
    <div v-if="isMobile" class="meal-entries">
      <EntryRow
        v-for="entry in entriesByMeal[selectedMeal]"
        :key="entry.id"
        :entry="entry"
        :mini="isMobile"
        @remove="diaryStore.removeEntry"
        @update="({ id, weight, mealType: m }) => diaryStore.updateEntry(id, weight, m)"
      />
    </div>

    <div v-if="voiceState === 'listening'" class="voice-status">🎤 Слушаю...</div>
    <div v-else-if="isParsing" class="voice-status">⏳ Распознаю...</div>
    <div v-else-if="voiceStatusError" class="voice-status voice-status--error">
      ⚠ {{ voiceStatusError }}
    </div>

    <VoiceConfirmModal
      v-model="voiceModalOpen"
      :intent="voiceIntent"
      @confirm="onVoiceConfirm"
      @closed="clearVoiceIntent"
    />

    <ProductSearch ref="productSearchRef" @select="onProductSelect" />
    <MobileBottomControls
      v-if="isMobile"
      :buttons="mobileButtons"
      @new-product="productModal = true"
      @new-recipe="showRecipesModal = true"
      @voice="onVoiceClick"
    />
  </div>
</template>

<style scoped>
.add-entry-wrap {
  height: calc(100dvh - var(--padding) - var(--header-height));
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.controls {
  margin-bottom: 1rem;
  display: flex;
  justify-content: end;
  align-items: center;
}
.meal-select {
  margin-right: auto;
}
.btn-mic {
  margin-right: 0.5rem;
  color: rgb(var(--color-darkgreen));
}
.btn-mic--active {
  color: rgb(var(--color-red, 220 38 38));
  animation: pulse 1s infinite;
}
.btn-mic--busy {
  opacity: 0.5;
}
.btn-recipes {
  margin-right: 0.5rem;
}
.product-modal {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.meal-entries {
  overflow-y: auto;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 4px 0 8px;
}
.entry-row:last-child {
  margin-bottom: 1rem;
}
.voice-status {
  font-size: 0.85rem;
  padding: 6px 10px;
  margin-bottom: 6px;
  border-radius: var(--border-radius);
  background: rgba(var(--color-darkgreen), 0.08);
  color: rgb(var(--color-darkgreen));
}
.voice-status--error {
  background: rgba(220, 38, 38, 0.08);
  color: rgb(220, 38, 38);
}
.voice-intent {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 0.85rem;
  padding: 6px 10px;
  margin-bottom: 6px;
  border-radius: var(--border-radius);
  background: rgba(var(--color-darkgreen), 0.1);
  color: rgb(var(--color-darkgreen));
  border: 1px solid rgba(var(--color-darkgreen), 0.25);
}
.voice-intent__dismiss {
  appearance: none;
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  font-size: 1rem;
  line-height: 1;
  padding: 0 2px;
  opacity: 0.6;
}
.voice-intent__dismiss:hover {
  opacity: 1;
}
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}
</style>
