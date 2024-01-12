export class Standardizer {
  mean: number;
  stddev: number;
  constructor() {
    this.mean = 0;
    this.stddev = 0;
  }
  fit(data: (number | null | undefined)[]): this {
    let i = 0;
    let total = data.length;
    let sum = 0;
    while (i < data.length) {
      if (!data[i]) {
        i += 1;
        total -= 1;
        continue;
      } else {
        sum += data[i] as number;
      }
      i += 1;
    }
    this.mean = sum / total;
    i = 0;
    let sumSq = 0;
    while (i < data.length) {
      if (!data[i]) {
        i += 1;
        continue;
      } else {
        sumSq += ((data[i] as number) - this.mean) ** 2;
      }
      i += 1;
    }
    this.stddev = Math.sqrt(sumSq / total);
    return this;
  }
}
