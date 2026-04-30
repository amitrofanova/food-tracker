<script setup lang="ts">
import { AppModal } from '@/shared/ui/modal';
import { AppButton } from '@/shared/ui/button';
import { useUserStore } from '@/entities/user';
import { useDiaryStore } from '@/entities/diary-entry';
import { saveDiaryEntry } from '@/shared/api/diary';
import { db } from '@/shared/db';

const userStore = useUserStore();
const diaryStore = useDiaryStore();

const pendingCount = ref(0);
const isSyncing = ref(false);

watch(
  () => userStore.hasPendingSync,
  async (val) => {
    if (val) {
      const entries = await db.getAllEntries();
      pendingCount.value = entries.length;
    }
  },
  { immediate: true },
);

async function confirmSync() {
  isSyncing.value = true;
  try {
    const entries = await db.getAllEntries();
    for (const entry of entries) {
      const { id, ...rest } = entry;
      await saveDiaryEntry(rest);
    }
    await db.entries.clear();
    userStore.hasPendingSync = false;
    await diaryStore.loadEntries();
  } finally {
    isSyncing.value = false;
  }
}

async function discardLocal() {
  await db.entries.clear();
  userStore.hasPendingSync = false;
  await diaryStore.loadEntries();
}
</script>

<template>
  <AppModal
    :model-value="userStore.hasPendingSync"
    title="Sync local data"
    :close-on-click-outside="false"
    :show-close-button="false"
    max-width="420px"
    @update:model-value="() => {}"
  >
    <p>
      You have <strong>{{ pendingCount }}</strong>
      {{ pendingCount === 1 ? 'entry' : 'entries' }} saved offline. Would you like to sync them to
      your account?
    </p>
    <div style="display: flex; gap: 8px; margin-top: 16px; justify-content: flex-end">
      <AppButton color="rgb(var(--color-primary))" :disabled="isSyncing" @click="discardLocal"
        >Discard</AppButton
      >
      <AppButton :disabled="isSyncing" @click="confirmSync">
        {{ isSyncing ? 'Syncing…' : 'Yes, sync' }}
      </AppButton>
    </div>
  </AppModal>
</template>
