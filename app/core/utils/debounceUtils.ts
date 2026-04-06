/*
 * File: debounceUtils.ts
 * Author: Ahmed Emad Nasr
 * Purpose: Provide a lightweight debounce utility with cancel support
 */

interface DebouncedFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): void;
  cancel: () => void;
}

export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): DebouncedFunction<T> => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

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
