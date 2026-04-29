type DebouncedFunction<T extends (...args: any[]) => any> = (
  ...args: Parameters<T>
) => void;

export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
): DebouncedFunction<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  return function (...args: Parameters<T>) {
    if (timeout !== undefined) clearTimeout(timeout);

    timeout = setTimeout(() => {
      callback.apply(null, args);
    }, delay);
  } as DebouncedFunction<T>;
}
