<script setup lang="ts">
import { useProductStore } from '@/entities/product';
import { ProductSearch } from '@/features/product-search';
import { DailySummary } from '@/widgets/daily-summary';
import { DateNavigation } from '@/widgets/date-navigation';

const productStore = useProductStore();

const products = productStore.products;
</script>

<template>
  <DateNavigation />
  <div class="wrap">
    <DailySummary />
    <ProductSearch />
  </div>
  <div v-for="product in products" :key="product.name">
    {{ product.name }}
  </div>
</template>

<style scoped>
.wrap {
  display: flex;
}
</style>
