export interface Time {
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
}

/**
 * Get current time as an object
 * @returns Object with hours, minutes, seconds, and milliseconds.
 */
export function useTime(): Time {
  const time = new Date();
  return {
    hours: time.getHours(),
    minutes: time.getMinutes(),
    seconds: time.getSeconds(),
    milliseconds: time.getMilliseconds(),
  };
}
