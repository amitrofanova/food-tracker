<!-- src/features/food-tracking//ui/DateSlider.vue -->
<script setup lang="ts">
import { useDateNavigation } from '@/features/date-navigation/lib/useDateNavigation';

const { startDateIndex, visibleDates, handleDateClick, scrollLeft, scrollRight, canScrollRight } =
  useDateNavigation();
</script>

<template>
  <div class="date-slider-container">
    <button class="nav-button" @click="scrollLeft" :disabled="startDateIndex <= 0">←</button>

    <div class="slider-container">
      <div class="slider-track">
        <div
          v-for="(dateItem, index) in visibleDates"
          :key="index"
          class="date-item"
          :class="{
            today: dateItem.isToday,
            selected: dateItem.isSelected,
            future: dateItem.isFuture,
            placeholder: dateItem.isPlaceholder,
            unselectable: !dateItem.isSelectable && !dateItem.isPlaceholder,
          }"
          @click="handleDateClick(dateItem)"
        >
          <div v-if="!dateItem.isPlaceholder" class="day-of-week">{{ dateItem.dayOfWeek }}</div>
          <div v-if="!dateItem.isPlaceholder" class="date-number">{{ dateItem.display }}</div>
        </div>
      </div>

      <!-- Визуальный указатель (стрелка) - ВАШ СТИЛЬ -->
      <div class="selection-indicator">
        <div class="arrow"></div>
      </div>
    </div>

    <button class="nav-button" @click="scrollRight" :disabled="!canScrollRight">→</button>
  </div>
</template>

<style scoped>
.date-slider-container {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
  margin-bottom: 16px;
  position: relative;
  max-width: 100%;
  overflow: hidden;
}

.nav-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e9ecef;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-button:hover:not(:disabled) {
  background: #d4d7d9;
  transform: scale(1.1);
}

.slider-container {
  flex: 1;
  position: relative;
  overflow: hidden;
  min-height: 60px;
  max-width: 100%;
}

.slider-track {
  display: flex;
  gap: 8px;
  width: 100%;
  height: 100%;
  position: relative;
  transition: transform 0.3s ease;
}

.date-item {
  min-width: 64px;
  height: 64px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  flex-shrink: 0;
  width: calc(10% - 8px); /* Ровно 10 дат на всю ширину */
  box-sizing: border-box;
}

.date-item:hover:not(.selected):not(.unselectable):not(.placeholder) {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.date-item.today {
  background: #e8f5e9;
  color: #4caf50;
}

.date-item.selected {
  font-weight: 700;
}

.date-item.selected::after {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  content: '';
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 10px solid #2196f3;
}

.date-item.future,
.date-item.unselectable {
  opacity: 0.4;
  cursor: not-allowed;
}

.day-of-week {
  font-size: 0.75rem;
  text-transform: uppercase;
  margin-bottom: 2px;
  color: #666;
  font-weight: 500;
}

.date-number {
  font-weight: 600;
  font-size: 1rem;
  color: #333;
}

.date-item.selected .date-number,
.date-item.selected .day-of-week {
  color: #1976d2;
}

.date-item.today .date-number,
.date-item.today .day-of-week {
  color: #2e7d32;
  font-weight: 700;
}

/* Визуальный указатель (стрелка) - СОХРАНЯЕМ ВАШ СТИЛЬ */
.selection-indicator {
  position: absolute;
  bottom: -12px;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  pointer-events: none;
}

.arrow {
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 10px solid #2196f3;
  position: relative;
  left: calc(70% - 8px); /* Третья справа в 10-дневном слайдере (70%) */
  bottom: 2px;
}

/* Адаптивность для мобильных устройств */
@media (max-width: 768px) {
  .day-of-week {
    font-size: 0.65rem;
  }

  .date-number {
    font-size: 0.9rem;
  }

  .date-item {
    min-width: 56px;
    height: 56px;
  }

  .arrow {
    border-bottom: 8px solid #2196f3;
  }
}
</style>
