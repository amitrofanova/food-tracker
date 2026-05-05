<script setup lang="ts">
import { useUserStore } from '@/entities/user';
import { vClickOutside } from '@/shared/lib/directives/click-outside';
import { useRoute } from 'vue-router';

const userStore = useUserStore();
const { logout } = userStore;

const isOpen = ref(false);
const toggle = () => {
  isOpen.value = !isOpen.value;
};
const close = () => {
  isOpen.value = false;
};

const route = useRoute();
watch(
  () => route.fullPath,
  () => {
    close();
  },
);
</script>

<template>
  <div v-click-outside="close" class="burger-menu">
    <div class="burger-btn" @click="toggle">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <div v-show="isOpen" class="user-menu">
      <p class="">{{ userStore.user?.email }}</p>
      <ul>
        <li class="list-item"><RouterLink to="/my-products">Мои продукты</RouterLink></li>
        <li class="list-item">
          <RouterLink to="/calorie-calculator" class="link">Рассчитать норму калорий</RouterLink>
        </li>
        <li class="list-item"><button @click="logout">Выйти</button></li>
      </ul>
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
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 1rem;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
}
.user-menu p {
  text-align: center;
  font-weight: 700;
}
.list-item {
  list-style: none;
}
.list-item button {
  width: 100%;
  text-align: left;
  background: none;
  border: none;
}
.list-item a,
.list-item button {
  display: block;
  padding: 6px 12px;
  border-radius: var(--border-radius);
  color: var(--color-primary);
  cursor: pointer;
  font-size: 16px;
  text-decoration: none;
}
.list-item a:hover,
.list-item button:hover {
  background-color: #f5f5f5;
}

.list-item:last-child button:hover {
  background-color: rgb(248, 227, 231);
}
@media (max-width: 767px) {
  .burger-btn {
    display: flex;
  }
}
</style>
