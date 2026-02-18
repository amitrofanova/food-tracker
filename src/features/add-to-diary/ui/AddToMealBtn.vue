<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { MealType } from '@/shared/config/meals';

const props = defineProps<{ mealType: MealType }>();
const router = useRouter();

const goToSearch = () => {
  router.push(`/search/${props.mealType}`);
};
</script>

<template>
  <button @click="goToSearch" class="add-button">+</button>
</template>
