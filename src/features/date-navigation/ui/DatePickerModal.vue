<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useDateStore } from '@/features/date-navigation';
import { formatDate } from '@/shared/utilities/formatDate';

const dateStore = useDateStore();
const emit = defineEmits(['close']);

// Используем realToday из dateStore (уже в правильном формате)
const today = dateStore.realToday;

// Безопасное получение месяца и года из строки даты
const getSafeMonthYear = () => {
  try {
    const [yearStr, monthStr] = dateStore.currentDate.split('-');
    return {
      month: parseInt(monthStr, 10) - 1, // Месяцы в Date начинаются с 0
      year: parseInt(yearStr, 10),
    };
  } catch (error) {
    console.error('Error parsing date:', error);
    const now = new Date();
    return { month: now.getMonth(), year: now.getFullYear() };
  }
};

const safeDate = getSafeMonthYear();
const currentMonth = ref(safeDate.month);
const currentYear = ref(safeDate.year);

// Генерация дней месяца
const daysInMonth = computed(() => {
  try {
    const year = currentYear.value;
    const month = currentMonth.value;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    if (isNaN(firstDay.getTime()) || isNaN(lastDay.getTime())) {
      return [];
    }

    const days = [];

    // Добавляем пустые дни для выравнивания первого дня недели
    const firstDayOfWeek = firstDay.getDay() || 7;
    for (let i = 1; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    // Добавляем дни месяца
    for (let day = 1; day <= lastDay.getDate(); day++) {
      try {
        const date = new Date(year, month, day);
        if (isNaN(date.getTime())) continue;

        // Форматируем в ЛОКАЛЬНЫЙ формат (как в dateStore)
        const dateString = formatDate(date);

        days.push({
          day,
          date: dateString,
          isToday: dateString === today,
          isSelected: dateString === dateStore.currentDate,
          isFuture: dateString > today,
          dayOfWeek: date.getDay(),
        });
      } catch (error) {
        console.warn('Error generating day:', error);
        continue;
      }
    }

    return days;
  } catch (error) {
    console.error('Error generating days in month:', error);
    return [];
  }
});

// Переключение на предыдущий месяц
const prevMonth = () => {
  try {
    if (currentMonth.value === 0) {
      currentMonth.value = 11;
      currentYear.value -= 1;
    } else {
      currentMonth.value -= 1;
    }
  } catch (error) {
    console.error('Error in prevMonth:', error);
    resetToCurrentMonth();
  }
};

// Переключение на следующий месяц
const nextMonth = () => {
  try {
    // Получаем текущий месяц и год из realToday
    const [todayYearStr, todayMonthStr] = dateStore.realToday.split('-');
    const todayYear = parseInt(todayYearStr, 10);
    const todayMonth = parseInt(todayMonthStr, 10) - 1; // Месяцы с 0

    // Блокируем переход в будущее
    if (
      currentYear.value > todayYear ||
      (currentYear.value === todayYear && currentMonth.value >= todayMonth)
    ) {
      return;
    }

    if (currentMonth.value === 11) {
      currentMonth.value = 0;
      currentYear.value += 1;
    } else {
      currentMonth.value += 1;
    }
  } catch (error) {
    console.error('Error in nextMonth:', error);
    resetToCurrentMonth();
  }
};

// Сброс к текущему месяцу
const resetToCurrentMonth = () => {
  const [yearStr, monthStr] = dateStore.realToday.split('-');
  currentYear.value = parseInt(yearStr, 10);
  currentMonth.value = parseInt(monthStr, 10) - 1;
};

// Выбор даты
const selectDate = (dateString: string) => {
  if (!dateString || dateString > today) return;

  // Передаем дату в ЛОКАЛЬНОМ формате (как ожидает dateStore)
  dateStore.setSelectedDate(dateString);
  emit('close');
};

// Инициализация на текущий месяц выбранной даты
onMounted(() => {
  resetToSafeMonth();
});

// Безопасная инициализация месяца
const resetToSafeMonth = () => {
  try {
    const [yearStr, monthStr] = dateStore.currentDate.split('-');
    currentYear.value = parseInt(yearStr, 10);
    currentMonth.value = parseInt(monthStr, 10) - 1;
  } catch (error) {
    console.error('Error resetting to safe month:', error);
    resetToCurrentMonth();
  }
};
</script>

<template>
  <div class="modal-overlay" @click="emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3 class="month-title">
          {{
            new Date(currentYear, currentMonth, 1).toLocaleString('ru-RU', {
              month: 'long',
              year: 'numeric',
            })
          }}
        </h3>
        <div class="month-nav">
          <button @click="prevMonth" class="month-nav-btn">←</button>
          <button
            @click="nextMonth"
            class="month-nav-btn"
            :disabled="new Date(currentYear, currentMonth + 1, 1) > new Date()"
          >
            →
          </button>
        </div>
      </div>

      <div class="calendar-grid">
        <div class="day-header">Пн</div>
        <div class="day-header">Вт</div>
        <div class="day-header">Ср</div>
        <div class="day-header">Чт</div>
        <div class="day-header">Пт</div>
        <div class="day-header">Сб</div>
        <div class="day-header">Вс</div>

        <div
          v-for="(day, index) in daysInMonth"
          :key="index"
          class="calendar-day"
          :class="{
            empty: !day,
            today: day?.isToday,
            selected: day?.isSelected,
            future: day?.isFuture,
            weekend: day?.dayOfWeek === 6 || day?.dayOfWeek === 0,
          }"
          @click="day && selectDate(day.date)"
        >
          {{ day?.day }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  max-width: 400px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.modal-header {
  padding: 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #e9ecef;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.close-button:hover {
  background: #d4d7d9;
  transform: rotate(90deg);
}

.month-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.month-nav {
  display: flex;
  gap: 0.5rem;
}

.month-nav-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #e9ecef;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.month-nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.month-nav-btn:hover:not(:disabled) {
  background: #d4d7d9;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 0.5rem;
  gap: 4px;
}

.day-header {
  text-align: center;
  font-weight: 600;
  font-size: 0.85rem;
  color: #6c757d;
  padding: 0.5rem 0;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.calendar-day.empty {
  cursor: default;
  background: transparent;
}

.calendar-day:hover:not(.empty):not(.future) {
  background: #e3f2fd;
  transform: scale(1.05);
}

.calendar-day.today {
  background: #bbdefb;
  border: 2px solid #2196f3;
}

.calendar-day.selected {
  background: #4caf50;
  color: white;
  font-weight: 600;
}

.calendar-day.future {
  color: #ced4da;
  cursor: not-allowed;
}

.calendar-day.future:hover {
  background: transparent;
  transform: none;
}

.calendar-day.weekend {
  color: #dc3545;
}
</style>
