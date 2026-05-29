<script setup lang="ts">
import { AppButton } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { PageHeader } from '@/shared/ui/page-header';
import type { MealType } from '@/shared/config/meals';
import type { IProduct } from '@/entities/product';
import { CreateProductModal, EditProductModal, useCustomProducts } from '@/features/create-product';
import { useDiaryStore } from '@/entities/diary-entry';
import { useBreakpoints } from '@/shared/lib/breakpoints';
import MobileBottomControls from '@/shared/ui/mobile-bottom-controls/MobileBottomControls.vue';

const { products, isLoading, remove, save } = useCustomProducts();
const diaryStore = useDiaryStore();

const showAddModal = ref(false);
const editingProduct = ref<IProduct | null>(null);
const selectedMeal = ref<MealType>('breakfast');

const { isMobile } = useBreakpoints();

const onCreated = (product: IProduct) => {
  products.value.push(product);
};

const onAddEntry = (product: IProduct, weight: number, meal: MealType) => {
  diaryStore.addEntry(product, weight, meal);
  showAddModal.value = false;
};

const handleSave = async (product: IProduct) => {
  await save(product);
};
</script>

<template>
  <PageHeader title="Мои продукты">
    <AppButton v-if="!isMobile" @click="showAddModal = true">
      <Icon name="Plus" size="sm" />
      Добавить
    </AppButton>
  </PageHeader>

  <p v-if="isLoading" class="empty">Загрузка…</p>
  <p v-else-if="products.length === 0" class="empty">Пока нет ни одного продукта</p>

  <ul v-else class="list" role="list">
    <li v-for="p in products" :key="p.id" class="item">
      <div class="item-info">
        <span class="item-name">{{ p.name }}</span>
        <span class="item-meta">
          {{ p.calories }} ккал &middot; Б&nbsp;{{ p.protein }}&thinsp;г &middot; Ж&nbsp;{{
            p.fat
          }}&thinsp;г &middot; У&nbsp;{{ p.carbs }}&thinsp;г
        </span>
      </div>
      <div class="item-actions">
        <button class="action-btn" aria-label="Редактировать" @click="editingProduct = p">
          <Icon name="Pencil" size="sm" />
        </button>
        <button class="action-btn action-btn--danger" aria-label="Удалить" @click="remove(p.id)">
          <Icon name="Trash" size="sm" />
        </button>
      </div>
    </li>
  </ul>

  <MobileBottomControls
    v-if="isMobile"
    :buttons="[{ label: 'Добавить продукт', event: 'add' }]"
    @add="showAddModal = true"
  />

  <CreateProductModal
    v-model="showAddModal"
    :default-meal="selectedMeal"
    @created="onCreated"
    @add-entry="onAddEntry"
  />

  <EditProductModal
    v-if="editingProduct"
    :model-value="!!editingProduct"
    :product="editingProduct"
    @update:model-value="editingProduct = null"
    @save="handleSave"
  />
</template>

<style scoped>
.empty {
  color: rgb(var(--color-gray));
  text-align: center;
  margin-top: 3rem;
}
.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(var(--color-gray), 0.4);
  border-radius: var(--border-radius);
}
.item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.item-name {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.item-meta {
  font-size: 0.8rem;
  color: rgb(var(--color-gray));
}
.item-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}
.action-btn {
  appearance: none;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 6px;
  border-radius: var(--border-radius);
  color: rgb(var(--color-darkgreen));
  transition: background-color 0.15s ease;
}
.action-btn:hover {
  background-color: rgba(var(--bg-secondary), 0.15);
}
.action-btn--danger {
  color: rgb(var(--color-red));
}
.action-btn--danger:hover {
  background-color: rgba(var(--color-red), 0.1);
}
</style>
