import { useUnique } from "../utils/mod.ts";

export class ClassificationReport {
  /** Number of elements classified correctly */
  true: number;
  /** Number of elements classified incorrectly */
  false: number;
  /** Total number of elements */
  size: number;
  labels: string[];
  cMatrices: Map<string, ConfusionMatrix>;
  constructor(y: ArrayLike<unknown>, y1: ArrayLike<unknown>) {
    const unique = useUnique(y);
    if (unique.length <= 1) {
      throw new Error(
        `Cannot create a classification report for less than 1 class.`,
      );
    }
    this.true = 0;
    this.false = 0;
    this.size = y.length;
    this.labels = unique.map((x) => `${x}`);
    this.cMatrices = new Map();
    for (const label of unique) {
      let [tp, fn, fp, tn] = [0, 0, 0, 0];
      for (let i = 0; i < y.length; i += 1) {
        if (y1[i] !== label && y[i] !== label) tn += 1;
        else if (y1[i] !== label && y[i] === unique[0]) fn += 1;
        else if (y1[i] === label && y[i] !== label) fp += 1;
        else tp += 1;
      }
      this.true += tp + tn;
      this.false += fp + fn;
      this.cMatrices.set(
        `${label}`,
        new ConfusionMatrix([tp, fn, fp, tn]),
      );
    }
  }
  [Symbol.for("Deno.customInspect")]() {
    let res = `Classification Report`
    res += `\nNumber of classes:\t${this.labels.length}\n`
    res += `\n==================\nConfusion Matrices\n==================\n`
    for (const [label, matrix] of this.cMatrices.entries()) {
      res += `\nClass: ${label}`
      res += `\n\t${matrix.labelP}\t${matrix.labelN}\n${matrix.labelP}\t${matrix.truePositive}\t${matrix.falseNegative}\n${matrix.labelN}\t${matrix.falsePositive}\t${matrix.trueNegative}`;;
      res += `\nAccuracy: ${accuracyScore(matrix)}`
      res += `\nPrecision: ${precisionScore(matrix)}`
      res += `\nRecall: ${recallScore(matrix)}`
      res += `\nSpecificity: ${specificityScore(matrix)}`
      res += `\nF1 Score: ${f1Score(matrix)}`
      res += `\n`
    }
    return res;
  }
  /*
  [Symbol.for("Deno.customInspect")]() {
    let res = `\t${this.labels.join("\t")}`
    for (const label of this.labels) {
      res += `\n${label}`
      for (const label1 of this.labels) {
        res += `\t${}`
      }
    }
    return `\n\t${this.labelP}\t${this.labelN}\n${this.labelP}\t${this.truePositive}\t${this.falseNegative}\n${this.labelN}\t${this.falsePositive}\t${this.trueNegative}`;
  }
  */
}

/** Confusion matrix for the result. */
export class ConfusionMatrix {
  /** Number of positive elements classified correctly */
  truePositive: number;
  /** Number of negative elements classified incorrectly */
  falsePositive: number;
  /** Number of negative elements classified correctly */
  trueNegative: number;
  /** Number of positive elements classified incorrectly */
  falseNegative: number;
  /** Number of elements classified correctly */
  true: number;
  /** Number of elements classified incorrectly */
  false: number;
  /** Total number of elements */
  size: number;
  /** Label for positive elements */
  labelP: string;
  /** Label for negative elements */
  labelN: string;
  constructor(
    [tp, fn, fp, tn]: [number, number, number, number],
    [label1, label2]: [string?, string?] = [],
  ) {
    this.truePositive = tp;
    this.falseNegative = fn;
    this.falsePositive = fp;
    this.trueNegative = tn;
    this.true = tn + tp;
    this.false = fn + fp;
    this.size = this.true + this.false;
    this.labelP = label1 || "P";
    this.labelN = label2 || "N";
  }
  valueOf(): [number, number, number, number] {
    return [
      this.truePositive,
      this.falseNegative,
      this.falsePositive,
      this.trueNegative,
    ];
  }
  [Symbol.for("Deno.customInspect")]() {
    return `\n\t${this.labelP}\t${this.labelN}\n${this.labelP}\t${this.truePositive}\t${this.falseNegative}\n${this.labelN}\t${this.falsePositive}\t${this.trueNegative}`;
  }
  static fromResults(
    y: ArrayLike<unknown>,
    y1: ArrayLike<unknown>,
  ): ConfusionMatrix {
    const unique = useUnique(y);
    if (unique.length !== 2) {
      throw new Error(
        `Cannot create confusion matrix for ${unique.length} classes. Try ClassificationReport instead.`,
      );
    }
    let [tp, fn, fp, tn] = [0, 0, 0, 0];
    for (let i = 0; i < y.length; i += 1) {
      if (y1[i] === unique[1] && y[i] === unique[1]) tn += 1;
      else if (y1[i] === unique[1] && y[i] === unique[0]) fn += 1;
      else if (y1[i] === unique[0] && y[i] === unique[1]) fp += 1;
      else tp += 1;
    }
    return new this([tp, fn, fp, tn], [`${unique[0]}`, `${unique[1]}`]);
  }
}

/** The fraction of predictions that were correct */
export function accuracyScore(cMatrix: ConfusionMatrix): number {
  return cMatrix.true / cMatrix.size;
}
/** The fraction of "positive" predictions that were actually positive */
export function precisionScore(cMatrix: ConfusionMatrix): number {
  return cMatrix.truePositive / (cMatrix.truePositive + cMatrix.falsePositive);
}
/** The fraction of positives that were predicted correctly */
export function sensitivityScore(cMatrix: ConfusionMatrix): number {
  return cMatrix.truePositive / (cMatrix.truePositive + cMatrix.falseNegative);
}
/** The fraction of positives that were predicted correctly */
export const recallScore = sensitivityScore;
/** The fraction of negatives that were predicted correctly */
export function specificityScore(cMatrix: ConfusionMatrix): number {
  return cMatrix.trueNegative / (cMatrix.trueNegative + cMatrix.falsePositive);
}
export function f1Score(cMatrix: ConfusionMatrix): number {
  return (2 * cMatrix.truePositive) /
    ((2 * cMatrix.truePositive) + cMatrix.falsePositive +
      cMatrix.falseNegative);
}
