<script setup lang="ts">
import AppHeader from '@/widgets/header/ui/AppHeader.vue';
import { DefaultLayout } from '@/shared/ui/layout';
</script>

<template>
  <DefaultLayout>
    <template #header>
      <AppHeader />
    </template>
    <router-view />
  </DefaultLayout>
</template>

<style>
@import 'styles/index.css';
</style>
