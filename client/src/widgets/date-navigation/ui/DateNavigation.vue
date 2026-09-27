<script setup lang="ts">
import { useDiaryStore } from "@/entities/diary-entry";
import { storeToRefs } from "pinia";
import { shiftCalendarDate } from "@/shared/lib/calendarDate";
import { ButtonIcon } from "@/shared/ui/button";

const diaryStore = useDiaryStore();
const { selectedDate } = storeToRefs(diaryStore);

const formattedDate = computed(() => {
  const [year, month, day] = selectedDate.value.split("-");
  return `${day}.${month}.${year}`;
});

const prevDay = () => {
  diaryStore.setSelectedDate(shiftCalendarDate(selectedDate.value, -1));
};

const nextDay = () => {
  diaryStore.setSelectedDate(shiftCalendarDate(selectedDate.value, 1));
};
</script>

<template>
  <div class="nav-wrap">
    <ButtonIcon name="ArrowLeft" @click="prevDay" size="md" color="rgb(var(--color-darkgreen))" />
    <span>{{ formattedDate }}</span>
    <ButtonIcon name="ArrowRight" @click="nextDay" size="md" color="rgb(var(--color-darkgreen))" />
  </div>
</template>

<style scoped>
.nav-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
}
</style>
