<script setup lang="ts">
import { AppModal } from "@/shared/ui/modal";
import { AppButton } from "@/shared/ui/button";
import { useUserStore } from "@/entities/user";
import { useDiaryStore } from "@/entities/diary-entry";
import { createBrowserLocalDataSyncer } from "../lib/createBrowserSyncDeps";
import { formatPendingLocalSummary, type PendingLocalCounts } from "../lib/syncLocalData";

const userStore = useUserStore();
const diaryStore = useDiaryStore();
const syncer = createBrowserLocalDataSyncer();

const pendingCounts = ref<PendingLocalCounts>({ entries: 0, products: 0, recipes: 0 });
const activeAction = ref<"sync" | "discard" | null>(null);
const syncError = ref<string | null>(null);

const isBusy = computed(() => activeAction.value !== null);
const pendingSummary = computed(() => formatPendingLocalSummary(pendingCounts.value));

watch(
  () => userStore.hasPendingSync,
  async (open: boolean) => {
    if (!open) {
      syncError.value = null;
      return;
    }
    pendingCounts.value = await syncer.pendingCounts();
  },
  { immediate: true },
);

async function onConfirmSync() {
  activeAction.value = "sync";
  syncError.value = null;
  try {
    await syncer.confirmSync();
    userStore.hasPendingSync = false;
    userStore.notifySynced();
    await diaryStore.loadEntries();
  } catch (err) {
    syncError.value =
      err instanceof Error ? err.message : "Не удалось синхронизировать локальные данные";
  } finally {
    activeAction.value = null;
  }
}

async function onDiscardLocal() {
  activeAction.value = "discard";
  syncError.value = null;
  try {
    await syncer.discardLocal();
    userStore.hasPendingSync = false;
    userStore.notifySynced();
    await diaryStore.loadEntries();
  } catch (err) {
    syncError.value = err instanceof Error ? err.message : "Не удалось удалить локальные данные";
  } finally {
    activeAction.value = null;
  }
}
</script>

<template>
  <AppModal
    :model-value="userStore.hasPendingSync"
    title="Локальные данные"
    :close-on-click-outside="false"
    :show-close-button="false"
    max-width="420px"
    @update:model-value="() => {}"
  >
    <p v-if="pendingSummary">
      У вас есть локальные данные без синхронизации:
      <strong>{{ pendingSummary }}</strong
      >. Перенести их в аккаунт?
    </p>
    <p v-else>У вас есть локальные данные без синхронизации. Перенести их в аккаунт?</p>
    <p v-if="syncError" class="error">{{ syncError }}</p>
    <div class="actions">
      <AppButton color="rgb(var(--color-darkgreen))" :disabled="isBusy" @click="onDiscardLocal">
        Не переносить
      </AppButton>
      <AppButton :disabled="isBusy" @click="onConfirmSync">
        {{ activeAction === "sync" ? "Синхронизация…" : "Да, синхронизировать" }}
      </AppButton>
    </div>
  </AppModal>
</template>

<style scoped>
.actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  justify-content: flex-end;
}

.error {
  color: rgb(var(--color-red));
  margin-top: 12px;
}
</style>
