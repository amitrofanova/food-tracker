<script setup lang="ts">
import type { IProduct } from '@/entities/product';
import { CreateProductModal } from '@/features/create-product';

const showAddModal = ref(false);
const onCreated = (product: IProduct) => {
  console.log(product);
};
</script>

<template>
  <div ref="barRef" class="bottom-bar">
    <slot>
      <button @click="showAddModal = true">ccc</button>
    </slot>
  </div>
  <CreateProductModal v-model="showAddModal" default-meal="breakfast" @created="onCreated" />
</template>

<style scoped>
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background-color: rgb(var(--bg-primary));
  border-top: 1px solid rgba(var(--color-gray), 0.2);
  z-index: 100;
}

.btn {
  flex: 1;
  appearance: none;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  border-radius: var(--border-radius);
  padding: 10px 16px;
  color: #fff;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: opacity 0.2s ease-in-out;
}

.btn:hover {
  opacity: 0.9;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
