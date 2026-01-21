<script setup lang="ts">
import { ref } from 'vue';
import FoodSearch from '@/features/food-search/components/FoodSearch.vue';
import MealList from '@/features/food-tracking/components/MealList.vue';
import CustomFoodForm from '@/features/food-tracking/components/CustomFoodForm.vue';
import CalorieProgress from '@/features/food-tracking/components/CalorieProgress.vue';

const showCustomFoodForm = ref(false);
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <h1>Трекер калорий</h1>
      <div class="header-actions">
        <button @click="showCustomFoodForm = true" class="custom-food-btn">➕ Свой продукт</button>
      </div>
      <div class="date-display">
        {{
          new Date().toLocaleDateString('ru-RU', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        }}
      </div>
    </header>

    <CalorieProgress />
    <FoodSearch />
    <MealList />

    <Teleport to="body">
      <div v-if="showCustomFoodForm" class="modal-overlay" @click="showCustomFoodForm = false">
        <div class="modal-content" @click.stop>
          <button class="modal-close" @click="showCustomFoodForm = false">✕</button>
          <CustomFoodForm @close="showCustomFoodForm = false" />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.app-header {
  text-align: center;
  margin-bottom: 2rem;
  padding: 1.5rem 0;
  position: relative;
}

.app-header h1 {
  font-size: 2.25rem;
  color: var(--dark);
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.date-display {
  color: #6c757d;
  font-size: 1.1rem;
  margin-top: 0.5rem;
}

.header-actions {
  position: absolute;
  right: 0;
  top: 1.5rem;
}

.custom-food-btn {
  background: #e3f2fd;
  color: #1976d2;
  border: 1px solid #bbdefb;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.95rem;
}

.custom-food-btn:hover {
  background: #bbdefb;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  position: relative;
  animation: modalAppear 0.3s ease;
  padding: 1rem;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f5f5f5;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #e0e0e0;
  transform: rotate(90deg);
}

@keyframes modalAppear {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
