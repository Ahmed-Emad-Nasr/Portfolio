/**
 * @description Lightweight debounce utility to replace lodash/debounce
 * Ensures only one execution of a function after a delay, with cancel support
 */

interface DebouncedFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): void;
  cancel: () => void;
}

export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): DebouncedFunction<T> => {
  let timeout: NodeJS.Timeout | null = null;

  const debounced = (...args: Parameters<T>): void => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
      timeout = null;
    }, wait);
  };

  debounced.cancel = (): void => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
};
