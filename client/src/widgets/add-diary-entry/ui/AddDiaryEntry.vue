<script setup lang="ts">
import type { IProduct } from '@/entities/product';
import type { IRecipe } from '@/entities/recipe';
import { useDiaryStore } from '@/entities/diary-entry';
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

const diaryStore = useDiaryStore();
const { save } = useRecipes();
const { isMobile } = useBreakpoints();
const props = defineProps<{ mealType?: MealType }>();
const selectedMeal = ref<MealType>(props.mealType || 'breakfast');
const showModal = ref(false);
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
    showModal.value = false;
  }
};

const onProductSelect = (product: IProduct, weight: number) => {
  diaryStore.addEntry(product, weight, selectedMeal.value);
};

const onSaved = async (recipe: IRecipe) => {
  await save(recipe);
  showRecipesModal.value = false;
};
</script>

<template>
  <div class="add-entry-wrap">
    <div v-if="!isMobile" class="controls">
      <MealSelect v-model="selectedMeal" class="meal-select" />
      <AppButton class="btn-recipes" @click="showRecipesModal = true">
        <Icon name="PlusSymbol" size="sm" />
        Рецепт
      </AppButton>
      <AppButton @click="showModal = true" class="btn-create">
        <Icon name="PlusSymbol" size="sm" />
        <span>Продукт</span>
      </AppButton>
    </div>
    <AppModal v-model="showModal" :width="isMobile ? '100vh' : 'auto'">
      <div class="product-modal">
        <CreateProductForm @created="handleCreated" />
        <AddEntryForm
          :disabled="!enabledAddProductForm"
          :newProduct="createdProduct"
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
      <RecipeForm @saved="onSaved" style="overflow: hidden; height: 700px" />
    </AppModal>
    <ProductSearch @select="onProductSelect" />
    <RouterLink v-if="isMobile" to="/recipes" class="btn-recipes-mobile">
      <Icon name="Book" />
    </RouterLink>
    <button v-if="isMobile" @click="showModal = true" class="btn-create">
      <Icon name="PlusSymbol" />
    </button>
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
@media (max-width: 767px) {
  .btn-create {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    width: 36px;
    height: 36px;
    font-size: 28px;
    line-height: 28px;
  }
}
.btn-recipes {
  margin-right: 0.5rem;
}
.btn-recipes-mobile {
  position: fixed;
  bottom: 1rem;
  right: 3.75rem;
  width: 36px;
  height: 36px;
  background-color: rgb(var(--color-primary));
  color: white;
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}
.product-modal {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
</style>
