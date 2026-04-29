<script setup lang="ts">
import { useUserStore } from '@/entities/user';
import { vClickOutside } from '@/shared/lib/directives/click-outside';

const userStore = useUserStore();
const { logout } = userStore;

const isOpen = ref(false);
const toggle = () => {
  isOpen.value = !isOpen.value;
};
const close = () => {
  isOpen.value = false;
};
</script>

<template>
  <div v-click-outside="close" class="burger-menu">
    <div class="burger-btn" @click="toggle">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <div v-show="isOpen" class="user-menu">
      <p>{{ userStore.user?.email }}</p>
      <button @click="logout">Выйти</button>
    </div>
  </div>
</template>

<style scoped>
.burger-menu {
  position: relative;
}
.burger-btn {
  display: flex;
  flex-direction: column;
  gap: 5px;
  cursor: pointer;
}
.burger-btn:hover span {
  opacity: 0.8;
}
.burger-btn span {
  width: 25px;
  height: 3px;
  background-color: white;
  border-radius: 2px;
}
.user-menu {
  position: absolute;
  top: 300%;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 1rem;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
.user-menu button {
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  font-size: 16px;
}
@media (max-width: 767px) {
  .burger-btn {
    display: flex;
  }
}
</style>
