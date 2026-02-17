<script setup lang="ts">
import type { IProduct } from '../model/types';

interface Props {
  product: IProduct;
}

defineProps<Props>();
</script>

<template>
  <div class="card">{{ product.name }}</div>
</template>

<style scoped>
.card {
  padding: 10px;
  border: 1px solid;
}
</style>
