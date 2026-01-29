// src/app/composables/useDateNavigation.ts
import { ref, computed, watch, nextTick } from 'vue';
import { useDateStore } from '@/features/date-navigation/model/date.store';
import { formatDate } from '@/shared/utilities/formatDate';

export function useDateNavigation() {
  const dateStore = useDateStore();
  const startDateIndex = ref(0);
  const VISIBLE_DAYS = 10;
  const SELECTED_POSITION = 7; // Третья справа в 10-дневном слайдере

  // Вспомогательная функция для создания пустого элемента
  const createPlaceholderDate = () => ({
    date: '',
    display: '',
    dayOfWeek: '',
    isToday: false,
    isFuture: false,
    isSelected: false,
    isSelectable: false,
    isPlaceholder: true,
  });

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

  // Все даты для календаря (используем метод из store)
  const allAvailableDates = computed(() => {
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
  });

  // Видимые даты в слайдере
  const visibleDates = computed(() => {
    const dates = [];

    for (let i = 0; i < VISIBLE_DAYS; i++) {
      const index = startDateIndex.value + i;

      if (index >= allAvailableDates.value.length || index < 0) {
        dates.push(createPlaceholderDate());
        continue;
      }

      const dateItem = allAvailableDates.value[index];
      dates.push({
        ...dateItem,
        isSelected: dateItem.date === dateStore.currentDate,
      });
    }

    return dates;
  });

  // Позиционирование слайдера
  const positionSliderToSelectedDate = () => {
    const selectedIndex = allAvailableDates.value.findIndex(
      (d) => d.date === dateStore.currentDate,
    );
    if (selectedIndex === -1) return;

    const startPos = selectedIndex - SELECTED_POSITION;
    const minStartPos = 0;
    const maxStartPos = Math.max(0, allAvailableDates.value.length - VISIBLE_DAYS);

    startDateIndex.value = Math.min(maxStartPos, Math.max(minStartPos, startPos));
  };

  // Watcher для автоматического позиционирования
  watch(
    () => dateStore.currentDate,
    async () => {
      await nextTick();
      positionSliderToSelectedDate();
    },
    { immediate: true },
  );

  return {
    startDateIndex,
    visibleDates,
    allAvailableDates,
    positionSliderToSelectedDate,
    SELECTED_POSITION,
    handleDateClick: (dateItem: any) => {
      if (dateItem.isSelectable && dateItem.date) {
        dateStore.setSelectedDate(dateItem.date);
      }
    },
    scrollLeft: () => {
      if (startDateIndex.value <= 0) return;

      startDateIndex.value--;
      const newIndex = startDateIndex.value + SELECTED_POSITION;
      if (newIndex < allAvailableDates.value.length) {
        const newDate = allAvailableDates.value[newIndex].date;
        if (allAvailableDates.value[newIndex].isSelectable) {
          dateStore.setSelectedDate(newDate);
        }
      }
    },
    scrollRight: () => {
      const maxStartIndex = allAvailableDates.value.length - VISIBLE_DAYS;
      if (startDateIndex.value >= maxStartIndex || dateStore.currentDate === dateStore.realToday)
        return;

      startDateIndex.value++;
      const newIndex = startDateIndex.value + SELECTED_POSITION;
      if (newIndex < allAvailableDates.value.length) {
        const newDate = allAvailableDates.value[newIndex].date;
        if (allAvailableDates.value[newIndex].isSelectable) {
          dateStore.setSelectedDate(newDate);
        }
      }
    },
    canScrollRight: computed(() => {
      return (
        startDateIndex.value < allAvailableDates.value.length - VISIBLE_DAYS &&
        dateStore.currentDate !== dateStore.realToday
      );
    }),
    goToToday: () => {
      dateStore.goToToday();
    },
  };
}
