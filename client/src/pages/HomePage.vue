<script setup lang="ts">
import { useProductStore } from '@/entities/product';
import { ProductSearch } from '@/features/product-search';
import { DailySummary } from '@/widgets/daily-summary';
import { DateNavigation } from '@/widgets/date-navigation';

const productStore = useProductStore();

const products = productStore.products;
</script>

<template>
  <ProductSearch />
  <DateNavigation />
  <DailySummary />
  <div v-for="product in products" :key="product.name">
    {{ product.name }}
  </div>
</template>
