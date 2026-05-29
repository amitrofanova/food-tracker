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
import { MealSelect } from '@/shared/ui/select';
import { MobileBottomControls } from '@/shared/ui/mobile-bottom-controls';

const diaryStore = useDiaryStore();
const { entriesByMeal } = storeToRefs(diaryStore);
const { save } = useRecipes();
const { isMobile, isDesktop } = useBreakpoints();
const props = defineProps<{ mealType?: MealType }>();
const selectedMeal = ref<MealType>(props.mealType || 'breakfast');
const productModal = ref(false);
const showRecipesModal = ref(false);

const onProductSelect = (product: IProduct, weight: number) => {
  diaryStore.addEntry(product, weight, selectedMeal.value);
};

const onSaved = async (recipe: IRecipe) => {
  await save(recipe);
};
</script>

<template>
  <div class="add-entry-wrap">
    <div v-if="isDesktop" class="controls">
      <MealSelect v-model="selectedMeal" class="meal-select" />
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
    <ProductSearch @select="onProductSelect" />
    <MobileBottomControls
      v-if="isMobile"
      :buttons="[
        { label: 'Новый продукт', event: 'new-product' },
        { label: 'Новый рецепт', event: 'new-recipe' },
      ]"
      @new-product="productModal = true"
      @new-recipe="showRecipesModal = true"
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
}
.meal-select {
  margin-right: auto;
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
</style>
