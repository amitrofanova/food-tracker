import { ref, computed } from 'vue';
import { useProductStore } from '@/entities/product';

export function useProductSearch() {
  const query = ref('');
  const store = useProductStore();

  const results = computed(() => store.searchResults);

  const loading = ref(false);

  let debounceTimeout: number | null = null;
  const search = () => {
    if (debounceTimeout) clearTimeout(debounceTimeout);
    debounceTimeout = window.setTimeout(() => {
      store.search(query.value);
    }, 300);
  };

  return {
    query,
    results,
    loading,
    search,
  };
}
