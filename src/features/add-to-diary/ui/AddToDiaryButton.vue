<script setup lang="ts">
import { ref } from 'vue';
import type { IProduct } from '@/entities/product';
import { useAddToDiary } from '../lib/useAddToDiary';

const props = defineProps<{ product: IProduct }>();
const { addEntry } = useAddToDiary();

const isFormOpen = ref(false);
const weight = ref<number | null>(null);

const toggleForm = () => {
  isFormOpen.value = !isFormOpen.value;
  if (!isFormOpen.value) weight.value = null;
};

const handleAdd = () => {
  if (weight.value && weight.value > 0) {
    addEntry(props.product, weight.value);
    isFormOpen.value = false;
    weight.value = null;
  }
};
</script>

<template>
  <div class="add-to-diary">
    <button @click="toggleForm" class="add-btn">
      {{ isFormOpen ? 'Отмена' : 'Добавить' }}
    </button>
    <div v-if="isFormOpen" class="form">
      <input
        type="number"
        v-model.number="weight"
        placeholder="Вес (г)"
        min="1"
        class="weight-input"
      />
      <button @click="handleAdd" :disabled="!weight" class="save-btn">Сохранить</button>
    </div>
  </div>
</template>

<style scoped>
.add-to-diary {
  display: inline-block;
}
.add-btn {
  padding: 4px 8px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.form {
  margin-top: 8px;
  display: flex;
  gap: 8px;
}
.weight-input {
  width: 80px;
  padding: 4px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.save-btn {
  padding: 4px 8px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.save-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
