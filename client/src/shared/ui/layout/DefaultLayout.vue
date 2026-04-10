<template>
  <slot name="header"></slot>
  <main class="main">
    <slot />
  </main>
</template>

<style scoped>
.main {
  padding: var(--padding-mobile) var(--padding-mobile) 0;
}
@media (min-width: 768px) {
  .main {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--padding) var(--padding) 0;
  }
}
</style>
