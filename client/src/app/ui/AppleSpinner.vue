<template>
  <svg
    width="120"
    height="120"
    viewBox="0 0 30 30"
    xmlns="http://www.w3.org/2000/svg"
    class="spinner"
  >
    <defs>
      <!-- Blur applied ONLY to the mask, not the visible line -->
      <filter id="softMask" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="0.6" />
      </filter>

      <!-- This mask controls where the green stroke is visible -->
      <mask id="flowMask" maskUnits="userSpaceOnUse" x="0" y="0" width="30" height="30">
        <path
          ref="maskPath"
          :d="pathData"
          fill="none"
          stroke="white"
          stroke-width="4"
          stroke-linecap="round"
          filter="url(#softMask)"
        />
      </mask>
    </defs>

    <!-- Gray base shape (always visible) -->
    <path
      :d="pathData"
      fill="none"
      stroke="#9ca3af"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <!-- Green stroke, revealed through the animated mask -->
    <path
      :d="pathData"
      fill="none"
      stroke="#22c55e"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      mask="url(#flowMask)"
    />
  </svg>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const maskPath = ref<SVGPathElement | null>(null);

const pathData =
  'M13.2,26.5L13.2,26.5c-1.1,0.7-2.6,0.6-3.7-0.1c-2.1-1.4-5.1-4.4-5.2-10.7c-0.1-2.9,2.1-5.5,5-5.7c1.2-0.1,2.4,0.3,3.3,0.9c1.4,0.9,3.3,0.9,4.7,0c0.9-0.6,2.1-1,3.3-0.9c2.9,0.2,5.1,2.8,5,5.7c-0.1,6.3-3.1,9.4-5.2,10.7c-1.1,0.7-2.5,0.7-3.7,0.1l0,0C15.7,25.9,14.3,25.9,13.2,26.5z M15.3,4.5c-1.3,1.3-1.8,3-1.5,4.6c1.6,0.3,3.3-0.2,4.6-1.5s1.8-3,1.5-4.6C18.4,2.7,16.6,3.2,15.3,4.5z';

let pathLength = 0;
let animationId: number | null = null;
let startTime: number | null = null;
const DURATION = 1600;

function animate(timestamp: number) {
  if (!startTime) startTime = timestamp;
  const elapsed = timestamp - startTime;
  const progress = (elapsed % DURATION) / DURATION;
  const offset = -progress * pathLength;

  if (maskPath.value) {
    maskPath.value.setAttribute('stroke-dashoffset', String(offset));
  }

  animationId = requestAnimationFrame(animate);
}

onMounted(() => {
  if (maskPath.value) {
    pathLength = maskPath.value.getTotalLength();

    // ──────────────────────────────────────────────
    // ADJUST GREEN vs GRAY RATIO HERE:
    //   0.55 = 55% green, 45% gray
    //   Increase → more green, less gray
    //   Decrease → less green, more gray
    // ──────────────────────────────────────────────
    const greenRatio = 0.55;
    const dash = pathLength * greenRatio;
    const gap = pathLength * (1 - greenRatio);

    maskPath.value.setAttribute('stroke-dasharray', `${dash} ${gap}`);

    animationId = requestAnimationFrame(animate);
  }
});

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId);
});
</script>

<style scoped>
.spinner {
  display: block;
  shape-rendering: geometricPrecision;
}
</style>
