<script setup lang="ts">
import AppHeader from '@/widgets/header/ui/AppHeader.vue';
import { DefaultLayout } from '@/shared/ui/layout';
import { useUserStore } from '@/entities/user';
import { useDiaryStore } from '@/entities/diary-entry';
import { SyncConfirmModal } from '@/features/sync-local-data';
import { storeToRefs } from 'pinia';

const { isLoggedIn } = storeToRefs(useUserStore());
const diaryStore = useDiaryStore();

watch(isLoggedIn, (loggedIn) => {
  if (loggedIn) {
    diaryStore.loadEntries();
  } else {
    diaryStore.clearEntries();
  }
});
</script>

<template>
  <DefaultLayout>
    <template #header>
      <AppHeader />
    </template>
    <router-view />
  </DefaultLayout>
  <SyncConfirmModal />
</template>

<style>
@import 'styles/index.css';
</style>
