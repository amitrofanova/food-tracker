<!-- src/features/food-search/ui/FoodSearch.vue -->
<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useFoodSearch } from '@/features/food-search/lib/useSearch';

const { searchResults, loading, error, searchFoods, offlineMode, clearResults } = useFoodSearch();

const emit = defineEmits(['add']);

const query = ref('');
const selectedMeal = ref<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
const portion = ref(100);
const activeTimeout = ref<NodeJS.Timeout | null>(null);

const filteredResults = computed(() => searchResults.value.slice(0, 8));

watch(query, (newVal) => {
  if (activeTimeout.value) {
    clearTimeout(activeTimeout.value);
  }

  if (newVal.length < 2) {
    clearResults();
    return;
  }

  activeTimeout.value = setTimeout(() => {
    if (newVal.length >= 2) {
      searchFoods(newVal);
    }
  }, 500);
});

const addFood = (food: any) => {
  emit('add', food, portion.value, selectedMeal.value);
  query.value = '';
  portion.value = 100;
  clearResults();
};
</script>

<template>
  <div class="search-container">
    <div v-if="offlineMode" class="api-warning">
      <p>⚠️ Режим оффлайн. Поиск будет осуществляться только по локальной базе.</p>
    </div>

    <div class="search-inputs">
      <input
        v-model="query"
        placeholder="Название продукта (минимум 2 символа)..."
        class="food-input"
      />
      <button
        @click="searchFoods(query)"
        :disabled="loading || query.length < 2"
        class="search-btn"
      >
        {{ loading ? 'Поиск...' : 'Найти' }}
      </button>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="filteredResults.length" class="results-container">
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
        <div
          v-for="food in filteredResults"
          :key="food.id"
          class="food-item"
          @click="addFood(food, portion)"
        >
          <div class="food-content">
            <div class="food-name">
              {{ food.name }}
            </div>
            <div class="food-nutrition">
              <span>{{ food.calories }} ккал/100г</span>
              <div class="macros">
                <span>Б:{{ food.protein }}г</span>
                <span>Ж:{{ food.fat }}г</span>
                <span>У:{{ food.carbs }}г</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="query.length >= 2 && filteredResults.length === 0" class="no-results">
      Продукты не найдены. Попробуйте изменить запрос или добавьте продукт вручную через кнопку
      "Свой продукт"
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

.api-warning {
  background: #fff8e1;
  border-left: 4px solid #ffc107;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 0 8px 8px 0;
  font-size: 0.9rem;
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
  padding: 0.75rem 1.5rem;
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

.no-results {
  text-align: center;
  padding: 1rem;
  color: #6c757d;
  font-style: italic;
  margin-top: 1rem;
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
  font-size: 0.95rem;
}

.meal-select {
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #ddd;
  font-size: 1rem;
}

.results-list {
  max-height: 300px;
  overflow-y: auto;
}

.food-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.food-content {
  flex: 1;
  min-width: 0;
}

.food-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
  word-wrap: break-word;
}

.food-badge {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0 4px;
  border-radius: 4px;
  margin-left: 4px;
  font-size: 0.8em;
  vertical-align: middle;
}

.food-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  margin-left: 1rem;
  flex-shrink: 0;
}

.food-nutrition {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #666;
}

.macros {
  display: flex;
  gap: 8px;
  margin-top: 4px;
  font-size: 0.85em;
  color: #6c757d;
}
</style>
