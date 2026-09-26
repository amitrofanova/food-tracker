import { useResizeObserver } from "@vueuse/core";
import type { MaybeRefOrGetter } from "vue";

/**
 * Fetch the next page when the user is near the bottom of `containerRef`,
 * or when the current items don't fill the container (so loading isn't stuck
 * behind a non-scrollable list).
 */
export function useLoadMoreOnScroll(
  containerRef: Ref<HTMLElement | null>,
  loadMore: () => unknown,
  options: {
    enabled: MaybeRefOrGetter<boolean>;
    loadedCount: MaybeRefOrGetter<number>;
    distance?: number;
  },
) {
  const distance = options.distance ?? 80;

  const check = () => {
    const el = containerRef.value;
    if (!el || el.clientHeight === 0 || !toValue(options.enabled)) return;
    const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (remaining <= distance) loadMore();
  };

  watch([() => toValue(options.enabled), () => toValue(options.loadedCount)], () => {
    void nextTick(check);
  });

  useResizeObserver(containerRef, () => {
    void nextTick(check);
  });

  onMounted(() => void nextTick(check));

  return { onScroll: check };
}
