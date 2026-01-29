<script setup lang="ts">
import MainPage from '@/pages/MainPage.vue';
</script>

<template>
  <MainPage />
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
    'Helvetica Neue', sans-serif;
  line-height: 1.6;
  color: #212529;
  background-color: #f1f3f5;
  padding: 16px;
  min-height: 100vh;
}

#app {
  max-width: 900px;
  margin: 0 auto;
}
</style>
