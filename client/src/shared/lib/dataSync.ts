import { ref } from "vue";

/**
 * Bumped when owned collections (custom products, recipes) should reload:
 * login, logout, and after guest data is synced or discarded.
 * Entity stores watch this so they do not import the user slice.
 */
export const dataSyncVersion = ref(0);

export function bumpDataSyncVersion(): void {
  dataSyncVersion.value += 1;
}
