<script setup lang="ts">
import type { IProduct } from '@/entities/product';
import type { IRecipe } from '@/entities/recipe';
import { useDiaryStore, EntryRow } from '@/entities/diary-entry';
import { storeToRefs } from 'pinia';
import { useBreakpoints } from '@/shared/lib/breakpoints';
import type { MealType } from '@/shared/config/meals';
import { CreateProductForm, AddEntryForm } from '@/features/create-product';
import { ProductSearch } from '@/features/product-search';
import { RecipeForm } from '@/widgets/recipe-form';
import { useRecipes } from '@/features/create-recipe';
import { Icon } from '@/shared/ui/icon';
import { AppModal } from '@/shared/ui/modal';
import { AppButton } from '@/shared/ui/button';
import { MealSelect } from '@/shared/ui/select';
import MobileBottomControls from '@/shared/ui/mobile-bottom-controls/MobileBottomControls.vue';

const diaryStore = useDiaryStore();
const { entriesByMeal } = storeToRefs(diaryStore);
const { save } = useRecipes();
const { isMobile } = useBreakpoints();
const props = defineProps<{ mealType?: MealType }>();
const selectedMeal = ref<MealType>(props.mealType || 'breakfast');
const productModal = ref(false);
const showRecipesModal = ref(false);

const createdProduct = ref<IProduct | null>(null);
const enabledAddProductForm = ref(false);
const handleCreated = (product: IProduct) => {
  createdProduct.value = product;
  enabledAddProductForm.value = true;
};
const addCreatedProduct = (weight: number, mealType: MealType) => {
  if (createdProduct.value) {
    diaryStore.addEntry(createdProduct.value, weight, mealType);
    createdProduct.value = null;
    enabledAddProductForm.value = false;
    productModal.value = false;
  }
};

const onProductSelect = (product: IProduct, weight: number) => {
  diaryStore.addEntry(product, weight, selectedMeal.value);
};

const onSaved = async (recipe: IRecipe) => {
  await save(recipe);
};
</script>

<template>
  <div class="add-entry-wrap">
    <div v-if="!isMobile" class="controls">
      <MealSelect v-model="selectedMeal" class="meal-select" />
      <AppButton class="btn-recipes" @click="showRecipesModal = true"> Свой рецепт </AppButton>
      <AppButton @click="productModal = true" class="btn-create"> Свой продукт </AppButton>
    </div>
    <AppModal v-model="productModal" :width="isMobile ? '100vh' : 'auto'">
      <div class="product-modal">
        <CreateProductForm @created="handleCreated" />
        <AddEntryForm
          :disabled="!enabledAddProductForm"
          :newProduct="createdProduct"
          :default-meal="selectedMeal"
          @add-entry="addCreatedProduct"
        />
      </div>
    </AppModal>
    <AppModal
      v-model="showRecipesModal"
      :width="'1000px'"
      title="Создать рецепт"
      style="overflow: hidden"
    >
      <RecipeForm
        @saved="onSaved"
        @added="showRecipesModal = false"
        :default-meal="selectedMeal"
        style="overflow: hidden; height: 700px"
      />
    </AppModal>
    <div v-if="isMobile" class="meal-entries">
      <EntryRow
        v-for="entry in entriesByMeal[selectedMeal]"
        :key="entry.id"
        :entry="entry"
        :compact="isMobile"
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
  height: calc(100vh - var(--padding) - var(--header-height));
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
}
.entry-row:last-child {
  margin-bottom: 1rem;
}
</style>
