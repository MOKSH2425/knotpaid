import { useRef } from "react";

// Prevents a handler from running twice from a rapid double-tap before
// React re-renders to disable the button. Our DB writes are synchronous,
// so two taps landing before the next render could otherwise create two
// rows (two expenses, two members, etc.) from a single intended tap.
export function useSubmitGuard() {
  const inFlight = useRef(false);

  return function guard<T extends unknown[]>(
    fn: (...args: T) => void | Promise<void>,
  ) {
    return async (...args: T) => {
      if (inFlight.current) return;
      inFlight.current = true;

      try {
        await fn(...args);
      } finally {
        inFlight.current = false;
      }
    };
  };
}
