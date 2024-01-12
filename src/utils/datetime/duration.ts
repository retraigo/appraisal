// For an advanced Duration module, check out https://github.com/nekooftheabyss/duration.js

export interface Duration {
    days: number,
    hours: number,
    minutes: number,
    seconds: number,
    milliseconds: number,
    microseconds: number,
    nanoseconds: number,
}

/**
 * Convert milliseconds into a duration object.
 * @param ms Duration in milliseconds.
 * @returns A duration object.
 */
export function useDuration(ms: number): Duration {
  return {
    days: Math.trunc(ms / 86400000),
    hours: Math.trunc(ms / 3600000) % 24,
    minutes: Math.trunc(ms / 60000) % 60,
    seconds: Math.trunc(ms / 1000) % 60,
    milliseconds: Math.trunc(ms) % 1000,
    microseconds: Math.trunc(ms * 1000) % 1000,
    nanoseconds: Math.trunc(ms * 1000000) % 1000,
  };
}
