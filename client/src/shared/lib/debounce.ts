// TODO
export function useDebounce<T extends (...args: any[]) => any>(fn: T, delay: number): T {
  let timeout: number | null = null;

  return ((...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = window.setTimeout(() => {
      fn(...args);
    }, delay);
  }) as T;
}
