<script setup lang="ts">
import { useRouter } from 'vue-router';
import { AppButton } from '@/shared/ui/button';
import { AppModal } from '@/shared/ui/modal';
import { Icon } from '@/shared/ui/icon';
import type { IProduct } from '@/entities/product';
import { CreateProductForm, useCustomProducts } from '@/features/create-product';

const router = useRouter();

const { products, isLoading, remove, save } = useCustomProducts();

const showAddModal = ref(false);

const onCreated = (product: IProduct) => {
  products.value.push(product);
  showAddModal.value = false;
};

interface EditForm {
  name: string;
  calories: number | null;
  protein: number | null;
  fat: number | null;
  carbs: number | null;
}

interface ValidatedEditForm {
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

function isValidEditForm(f: EditForm): f is ValidatedEditForm {
  return (
    f.name.trim().length > 0 &&
    typeof f.calories === 'number' &&
    f.calories > 0 &&
    [f.protein, f.fat, f.carbs].every((v): v is number => typeof v === 'number' && v >= 0)
  );
}

const editingId = ref<string | null>(null);
const editForm = reactive<EditForm>({
  name: '',
  calories: null,
  protein: null,
  fat: null,
  carbs: null,
});

const showEditModal = computed({
  get: () => editingId.value !== null,
  set: (open) => {
    if (!open) editingId.value = null;
  },
});

const isEditValid = computed(() => isValidEditForm(editForm));

const startEdit = (product: IProduct) => {
  editingId.value = product.id;
  editForm.name = product.name;
  editForm.calories = product.calories;
  editForm.protein = product.protein;
  editForm.fat = product.fat;
  editForm.carbs = product.carbs;
};

const handleEditSubmit = async () => {
  if (!isValidEditForm(editForm) || !editingId.value) return;
  const updated: IProduct = {
    id: editingId.value,
    name: editForm.name,
    calories: editForm.calories,
    protein: editForm.protein,
    fat: editForm.fat,
    carbs: editForm.carbs,
  };
  await save(updated);
  editingId.value = null;
};
</script>

<template>
  <div class="page-header">
    <button class="btn-back" aria-label="Назад" @click="router.back()">
      <Icon name="ArrowLeft" />
    </button>
    <h1 class="title">Мои продукты</h1>
    <AppButton size="sm" @click="showAddModal = true">
      <Icon name="PlusSymbol" size="sm" />
      Добавить
    </AppButton>
  </div>

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
        <button class="action-btn" aria-label="Редактировать" @click="startEdit(p)">
          <Icon name="Pencil" size="sm" />
        </button>
        <button class="action-btn action-btn--danger" aria-label="Удалить" @click="remove(p.id)">
          <Icon name="Trash" size="sm" />
        </button>
      </div>
    </li>
  </ul>

  <AppModal v-model="showAddModal" title="Новый продукт">
    <CreateProductForm @created="onCreated" />
  </AppModal>

  <AppModal v-model="showEditModal" title="Редактировать продукт">
    <form class="form" @submit.prevent="handleEditSubmit">
      <input
        v-model="editForm.name"
        placeholder="Название"
        required
        aria-required="true"
        class="full-width"
      />
      <input
        v-model.number="editForm.calories"
        type="number"
        min="1"
        placeholder="Калории (на 100г)"
        required
        aria-required="true"
        class="half-width"
      />
      <input
        v-model.number="editForm.protein"
        type="number"
        min="0"
        step="0.1"
        placeholder="Белки"
        required
        aria-required="true"
        class="half-width"
      />
      <input
        v-model.number="editForm.fat"
        type="number"
        min="0"
        step="0.1"
        placeholder="Жиры"
        required
        aria-required="true"
        class="half-width"
      />
      <input
        v-model.number="editForm.carbs"
        type="number"
        min="0"
        step="0.1"
        placeholder="Углеводы"
        required
        aria-required="true"
        class="half-width"
      />
      <AppButton type="submit" :disabled="!isEditValid" :aria-disabled="!isEditValid">
        Сохранить
      </AppButton>
    </form>
  </AppModal>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.title {
  flex: 1;
  margin: 0;
  font-size: 20px;
}
.btn-back {
  appearance: none;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 4px;
  color: rgb(var(--color-primary));
}
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
  border: 1px solid rgba(var(--color-secondary), 0.4);
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
  color: rgb(var(--color-secondary));
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
  color: rgb(var(--color-primary));
  transition: background-color 0.15s ease;
}
.action-btn:hover {
  background-color: rgba(var(--color-secondary), 0.15);
}
.action-btn--danger {
  color: rgb(var(--color-red));
}
.action-btn--danger:hover {
  background-color: rgba(var(--color-red), 0.1);
}
.form {
  display: grid;
  gap: 0.8rem;
  margin-top: 0.6rem;
}
.form input {
  appearance: none;
  border: 1px solid rgba(var(--color-secondary), 0.7);
  border-radius: var(--border-radius);
  padding: 6px;
  outline: none;
  width: 100%;
  box-sizing: border-box;
}
@media (min-width: 768px) {
  .form {
    min-width: 500px;
    grid-template-columns: 1fr 1fr;
  }
  .full-width {
    grid-column: 1 / -1;
  }
  .title {
    font-size: 24px;
  }
}
</style>
