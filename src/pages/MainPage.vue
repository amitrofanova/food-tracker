<script setup lang="ts">
import { ref } from 'vue';
import { FoodSearch } from '@/features/food-search';
import { MealList, CustomFoodForm, CalorieProgress } from '@/features/food-tracking';
import DateSlider from '@/features/date-navigation/ui/DateSlider.vue';
import DatePickerModal from '@/features/date-navigation/ui/DatePickerModal.vue';
import { useFoodTrackingStore } from '@/features/food-tracking';
import { useDateStore } from '@/features/date-navigation';

const trackingStore = useFoodTrackingStore();
console.log('🔍 FoodSearch store ID:', trackingStore.$id);

const handleAddFood = (food, portion, meal) => {
  trackingStore.addFoodEntry(food, portion, meal);
};

const showCustomFoodForm = ref(false);

const dateStore = useDateStore();
const showCalendar = ref(false);

// Форматируем сегодняшнюю дату для кнопки
const todayFormatted = computed(() => {
  const today = new Date(dateStore.realToday);
  return today.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  });
});
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <h1>Трекер калорий</h1>
      <div class="header-actions">
        <button @click="showCustomFoodForm = true" class="custom-food-btn">➕ Свой продукт</button>
      </div>
      <div class="date-display">
        <button @click="showCalendar = true" class="calendar-btn">📅</button>
        <button @click="dateStore.goToToday()" class="today-btn">
          {{ todayFormatted }}
        </button>
      </div>
    </header>

    <DateSlider ref="dateSliderRef" />
    <CalorieProgress />
    <FoodSearch @add="handleAddFood" />
    <MealList :entries="trackingStore.currentDayEntries" />

    <Teleport to="body">
      <div v-if="showCustomFoodForm" class="modal-overlay" @click="showCustomFoodForm = false">
        <div class="modal-content" @click.stop>
          <button class="modal-close" @click="showCustomFoodForm = false">✕</button>
          <CustomFoodForm @close="showCustomFoodForm = false" />
        </div>
      </div>
      <DatePickerModal v-if="showCalendar" @close="showCalendar = false" />
    </Teleport>
  </div>
</template>

<style scoped>
.app-header {
  text-align: center;
  padding: 1.5rem 0 0;
  position: relative;
}

.app-header h1 {
  font-size: 2.25rem;
  color: var(--dark);
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.date-display {
  display: flex;
  justify-self: center;
  color: #6c757d;
  margin-top: 2rem;
}

.calendar-btn {
  background: #e3f2fd;
  color: #1976d2;
  border: 1px solid #bbdefb;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  margin-right: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.calendar-btn:hover {
  background: #bbdefb;
  transform: scale(1.1);
}

.today-btn {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #a5d6a7;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.today-btn:hover {
  background: #c8e6c9;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.today-btn:active {
  transform: translateY(0);
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
