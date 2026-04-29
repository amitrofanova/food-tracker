// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DebouncedFunction<T extends (...args: any[]) => any> = (...args: Parameters<T>) => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
): DebouncedFunction<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  return function (...args: Parameters<T>) {
    if (timeout !== undefined) clearTimeout(timeout);

    timeout = setTimeout(() => {
      callback(...args);
    }, delay);
  } as DebouncedFunction<T>;
}
