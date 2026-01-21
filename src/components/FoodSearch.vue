<script setup lang="ts">
import { ref } from 'vue';
import { useFoodSearch } from '@/composables/useFoodSearch';
import { useTrackingStore } from '@/stores/trackingStore';

const { searchResults, loading, error, searchFoods } = useFoodSearch();
const store = useTrackingStore();
const query = ref('');
const selectedMeal = ref<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
const portion = ref(100);

const handleSearch = () => {
  if (query.value.trim()) {
    searchFoods(query.value);
  }
};

const addFood = (food: any) => {
  store.addFoodEntry(food, portion.value, selectedMeal.value);
  query.value = '';
  portion.value = 100;
  searchResults.value = [];
};
</script>

<template>
  <div class="search-container">
    <div class="search-inputs">
      <input
        v-model="query"
        @keyup.enter="handleSearch"
        placeholder="Название продукта..."
        class="food-input"
      />
      <button @click="handleSearch" :disabled="loading" class="search-btn">
        {{ loading ? 'Поиск...' : 'Найти' }}
      </button>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="searchResults.length" class="results-container">
      <div class="results-header">
        <span>Результаты поиска</span>
        <div class="portion-control">
          <label>Порция (г):</label>
          <input v-model.number="portion" type="number" min="1" class="portion-input" />
        </div>
      </div>

      <div class="meal-selector">
        <label>Прием пищи:</label>
        <select v-model="selectedMeal" class="meal-select">
          <option value="breakfast">Завтрак</option>
          <option value="lunch">Обед</option>
          <option value="dinner">Ужин</option>
          <option value="snack">Перекус</option>
        </select>
      </div>

      <div class="results-list">
        <div v-for="food in searchResults" :key="food.id" class="food-item" @click="addFood(food)">
          <div class="food-name">{{ food.name }}</div>
          <div class="food-nutrition">
            <span>{{ food.calories }} ккал</span>
            <span>Б:{{ food.protein }}г</span>
            <span>Ж:{{ food.fat }}г</span>
            <span>У:{{ food.carbs }}г</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-container {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.search-inputs {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.food-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.food-input:focus {
  outline: none;
  border-color: #4caf50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.search-btn {
  padding: 0 1.5rem;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.search-btn:hover:not(:disabled) {
  background: #43a047;
}

.search-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  color: #f44336;
  padding: 0.5rem;
  background: #ffebee;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
  margin-bottom: 1rem;
  font-weight: 600;
}

.portion-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.portion-input {
  width: 70px;
  padding: 0.4rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.meal-selector {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.meal-select {
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #ddd;
}

.results-list {
  max-height: 300px;
  overflow-y: auto;
}

.food-item {
  padding: 0.75rem;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.food-item:hover {
  background: #f5f5f5;
  transform: translateX(4px);
}

.food-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.food-nutrition {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #666;
}
</style>
