/**
 * Returns a debounced version of the given function. The debounced function delays
 * invoking the original function until after `timeoutMs` milliseconds have elapsed
 * since the last time the debounced function was invoked.
 */
export function debounce<F extends (...args: never) => void>(
  callback: F,
  timeoutMs: number,
): F {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (...args: never) {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      callback(...args);
    }, timeoutMs);
  } as F;
}
