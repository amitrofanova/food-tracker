<script setup lang="ts">
import type { IProduct } from '@/entities/product';
import { useDiaryStore } from '@/entities/diary-entry';
import { useBreakpoints } from '@/shared/lib/breakpoints';
import type { MealType } from '@/shared/config/meals';
import { CreateProductForm, AddEntryForm } from '@/features/create-product';
import { ProductSearch } from '@/features/product-search';
import { RecipesPanel } from '@/widgets/recipes-panel';
import { Icon } from '@/shared/ui/icon';
import { AppModal } from '@/shared/ui/modal';
import { AppButton } from '@/shared/ui/button';
import { MealSelect } from '@/shared/ui/select';

const diaryStore = useDiaryStore();
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
</script>

<template>
  <div class="add-entry-wrap">
    <div v-if="!isMobile" class="controls">
      <MealSelect v-model="selectedMeal" />
      <AppButton class="btn-recipes" @click="showRecipesModal = true">
        <Icon name="Book" size="sm" />
        Рецепты
      </AppButton>
      <AppButton @click="showModal = true" class="btn-create">
        <Icon name="PlusSymbol" size="sm" />
        <span>Свой продукт</span>
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
    <AppModal v-model="showRecipesModal" :width="'600px'">
      <RecipesPanel :mealType="selectedMeal" />
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
}
.btn-create {
  margin-left: auto;
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
