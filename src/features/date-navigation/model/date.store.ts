import { defineStore } from 'pinia';
import { ref, computed, onMounted } from 'vue';
import { formatDate } from '@/shared/utilities/formatDate';

export const useDateStore = defineStore('date', () => {
  const selectedDate = ref<string>('');

  // Получаем сегодняшнюю дату в локальном формате
  const realToday = computed(() => {
    const today = new Date();
    return today
      .toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
      .split('.')
      .reverse()
      .join('-');
  });

  // Валидация даты
  const isValidDate = (dateString: string): boolean => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && dateString === formatDate(date);
  };

  // Инициализация даты
  const initializeDate = () => {
    const savedDate = localStorage.getItem('selectedDate');

    if (savedDate && isValidDate(savedDate) && savedDate <= realToday.value) {
      selectedDate.value = savedDate;
    } else {
      selectedDate.value = realToday.value;
      localStorage.setItem('selectedDate', realToday.value);
    }
  };

  // Текущая выбранная дата
  const currentDate = computed(() => {
    if (!selectedDate.value || !isValidDate(selectedDate.value)) {
      selectedDate.value = realToday.value;
    }
    console.log('TYPE', typeof selectedDate.value);

    return selectedDate.value;
  });

  // Изменение выбранной даты
  const setSelectedDate = (dateString: string) => {
    if (!isValidDate(dateString) || dateString > realToday.value) return;

    selectedDate.value = dateString;
    localStorage.setItem('selectedDate', dateString);
  };

  // Навигация
  const goToPreviousDay = () => {
    const date = new Date(currentDate.value);
    date.setDate(date.getDate() - 1);
    const newDate = formatDate(date);
    const minDate = formatDate(new Date(2024, 0, 1));
    if (newDate >= minDate) {
      setSelectedDate(newDate);
    }
  };

  const goToNextDay = () => {
    if (currentDate.value >= realToday.value) return;

    const date = new Date(currentDate.value);
    date.setDate(date.getDate() + 1);
    const newDate = formatDate(date);
    if (newDate <= realToday.value) {
      setSelectedDate(newDate);
    }
  };

  const goToToday = () => {
    setSelectedDate(realToday.value);
  };

  // Генерация дат для слайдера
  const generateSliderDates = () => {
    const dates = [];
    const currentDateObj = new Date(2024, 0, 1); // Начинаем с 1 января 2024
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 2); // Максимум 2 дня в будущее

    while (currentDateObj <= maxDate) {
      const dateString = formatDate(currentDateObj);
      const isToday = dateString === realToday.value;
      const isFuture = dateString > realToday.value;

      dates.push({
        date: dateString,
        display: currentDateObj.toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'short',
        }),
        dayOfWeek: currentDateObj.toLocaleDateString('ru-RU', {
          weekday: 'short',
        }),
        isToday,
        isFuture,
        isSelectable: !isFuture, // Можно выбирать только даты до сегодня
      });

      // Переходим к следующему дню
      currentDateObj.setDate(currentDateObj.getDate() + 1);
    }

    return dates;
  };

  onMounted(() => {
    initializeDate();
  });

  return {
    currentDate,
    realToday,
    setSelectedDate,
    goToPreviousDay,
    goToNextDay,
    goToToday,
    generateSliderDates,
    isValidDate,
  };
});
