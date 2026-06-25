<script setup lang="ts">
import AppHeader from '@/widgets/header/ui/AppHeader.vue';
import { DefaultLayout } from '@/shared/ui/layout';
import { useUserStore } from '@/entities/user';
import { useDiaryStore } from '@/entities/diary-entry';
import { SyncConfirmModal } from '@/features/sync-local-data';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { useBreakpoints } from '@/shared/lib/breakpoints';

const { isLoggedIn } = storeToRefs(useUserStore());
const diaryStore = useDiaryStore();
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
  <DefaultLayout>
    <template #header>
      <AppHeader v-if="showHeader" />
    </template>
    <router-view />
  </DefaultLayout>
  <SyncConfirmModal />
</template>

<style>
@import 'styles/index.css';
</style>
