<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { AppHeader } from '@/widgets/header';
import { DefaultLayout } from '@/shared/ui/layout';
import { useUserStore } from '@/entities/user';
import { useDiaryStore } from '@/entities/diary-entry';
import { useRoute } from 'vue-router';
import { useBreakpoints } from '@/shared/lib/breakpoints';
import { SyncConfirmModal } from '@/features/sync-local-data';
import AppleSpinner from './ui/AppleSpinner.vue';

const { isLoggedIn } = storeToRefs(useUserStore());
const diaryStore = useDiaryStore();
const { isLoading } = storeToRefs(diaryStore);
const route = useRoute();
const { isMobile } = useBreakpoints();

const showHeader = computed(() => !(isMobile.value && route.meta.hideHeaderOnMobile));

watch(isLoggedIn, (loggedIn: boolean) => {
  if (loggedIn) {
    diaryStore.loadEntries();
  } else {
    diaryStore.clearEntries();
  }
});
</script>

<template>
  <div v-if="isLoading">
    <AppleSpinner />
  </div>
  <DefaultLayout v-else>
    <template #header>
      <AppHeader v-if="showHeader" />
    </template>
    <router-view />
  </DefaultLayout>
  <SyncConfirmModal />
</template>

<style>
@import 'styles/index.css';

.loading-screen {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
