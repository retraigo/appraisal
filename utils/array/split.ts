import { useShuffle } from "../random/shuffle.ts";

export interface Sliceable<T> {
  filter<T>(
    predicate: (value: T, index: number, array: T[]) => value is T,
  ): Sliceable<T>;
  slice(start?: number, end?: number): Sliceable<T>;
  length: number;
}

interface SplitOptions {
  ratio: [number, number];
  shuffle?: boolean;
}
Array.prototype;
/** Split arrays by their first axis */
export function useSplit(
  options: SplitOptions = { ratio: [7, 3], shuffle: false },
  ...arr: (Sliceable<unknown>)[]
): [typeof arr, typeof arr] {
  if (!arr.every((x) => x.length === arr[0].length)) {
    throw new Error("All arrays must have equal length!");
  }
  const { ratio, shuffle } = options;
  const idx = Math.floor(arr[0].length * (ratio[0] / (ratio[0] + ratio[1])));
  if (!shuffle) {
    return [
      arr.map((x) => x.slice(0, idx)),
      arr.map((x) => x.slice(idx)),
    ];
  } else {
    const shuffled = useShuffle(0, arr[0].length);
    const x1 = shuffled.slice(0, idx);
    const x2 = shuffled.slice(idx);
    return [
      arr.map((x) =>
        x.filter<typeof x>(
          ((_, i, __) => x1.includes(i)) as (
            value: unknown,
            index: number,
            array: unknown[],
          ) => value is typeof x,
        )
      ) as typeof arr,
      arr.map((x) =>
        x.filter<typeof x>(
          ((_, i, __) => x2.includes(i)) as (
            value: unknown,
            index: number,
            array: unknown[],
          ) => value is typeof x,
        )
      ) as typeof arr,
    ];
  }
}
