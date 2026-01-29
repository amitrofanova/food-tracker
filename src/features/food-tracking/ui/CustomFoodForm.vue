<script setup lang="ts">
import { ref } from 'vue';
import { useFoodTrackingStore } from '@/features/food-tracking/model/foodTrackingStore';

const emit = defineEmits(['close']);
const store = useFoodTrackingStore();

const formData = ref({
  name: '',
  calories: 0,
  protein: 0,
  fat: 0,
  carbs: 0,
});

const handleSubmit = () => {
  if (!formData.value.name.trim()) {
    alert('Пожалуйста, введите название продукта');
    return;
  }

  store.addCustomFood(formData.value);
  formData.value = {
    name: '',
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
  };
  emit('close');
};
</script>

<template>
  <div class="custom-food-form">
    <h3>Создать свой продукт</h3>

    <div class="form-group">
      <label>Название продукта</label>
      <input v-model="formData.name" placeholder="Название" class="form-input" />
    </div>

    <div class="form-row">
      <div class="form-group">
        <label>Калории (на 100г)</label>
        <input v-model.number="formData.calories" type="number" min="0" class="form-input" />
      </div>

      <div class="form-group">
        <label>Белки (г)</label>
        <input
          v-model.number="formData.protein"
          type="number"
          min="0"
          step="0.1"
          class="form-input"
        />
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label>Жиры (г)</label>
        <input v-model.number="formData.fat" type="number" min="0" step="0.1" class="form-input" />
      </div>

      <div class="form-group">
        <label>Углеводы (г)</label>
        <input
          v-model.number="formData.carbs"
          type="number"
          min="0"
          step="0.1"
          class="form-input"
        />
      </div>
    </div>

    <div class="form-actions">
      <button @click="emit('close')" class="btn-secondary">Отмена</button>
      <button @click="handleSubmit" class="btn-primary">Сохранить</button>
    </div>
  </div>
</template>

<style scoped>
.custom-food-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

.btn-primary {
  background: #4caf50;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #43a047;
}

.btn-secondary {
  background: #e9ecef;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #d4d7d9;
}
</style>
