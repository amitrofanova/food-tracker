<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useUserStore } from '@/entities/user';
import { CalorieBudgetBtn, CalorieBudgetForm } from '@/features/calorie-budget';
import { AppModal } from '@/shared/ui/modal';
import { AppButton } from '@/shared/ui/button';
import { UserAuthModal, UserMenu } from '@/entities/user';
import { useBreakpoints } from '@/shared/lib/breakpoints';
import { VoiceButton } from '@/widgets/voice-diary-entry';

const userStore = useUserStore();
const { isLoggedIn, authModalOpen } = storeToRefs(userStore);

const { isDesktop } = useBreakpoints();

const showCalorieBudgetForm = ref(false);
</script>

<template>
  <header class="header">
    <RouterLink to="/" class="logo">Food Tracker</RouterLink>
    <VoiceButton v-if="isDesktop" />
    <div class="controls">
      <template v-if="isLoggedIn">
        <CalorieBudgetBtn v-if="isDesktop" @click="showCalorieBudgetForm = true" />
        <UserMenu />
      </template>
      <AppButton v-else @click="userStore.openAuthModal()" size="sm" color="transparent">
        Войти
      </AppButton>
    </div>
    <UserAuthModal v-model="authModalOpen"></UserAuthModal>
    <AppModal v-model="showCalorieBudgetForm">
      <CalorieBudgetForm @close="showCalorieBudgetForm = false" />
    </AppModal>
  </header>
</template>

<style scoped>
.header {
  height: var(--header-height);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 var(--padding-mobile);
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.logo {
  margin: 0;
  line-height: normal;
  color: rgb(var(--color-darkgreen));
  font-size: 24px;
  font-weight: 700;
  text-decoration: none;
}
.controls {
  display: flex;
  gap: 10px;
  align-items: center;
}
@media (min-width: 768px) {
  .header {
    height: var(--header-height);
    padding: 0 var(--padding);
  }
  .logo {
    font-size: 32px;
  }
}
/* .voice-btn {
  opacity: ;
} */
</style>
