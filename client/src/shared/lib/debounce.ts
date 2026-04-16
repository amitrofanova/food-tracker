type DebouncedFunction<T extends (this: unknown, ...args: unknown[]) => unknown> = (
  this: ThisParameterType<T>,
  ...args: Parameters<T>
) => void;

export function useDebounce<T extends (this: unknown, ...args: unknown[]) => unknown>(
  callback: T,
  delay: number,
): DebouncedFunction<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (timeout !== undefined) clearTimeout(timeout);

    timeout = setTimeout(() => {
      callback.apply(this, args);
    }, delay);
  };
}
