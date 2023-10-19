/** Confusion matrix for the result. */
export class ConfusionMatrix {
    truePositive: number;
    falsePositive: number;
    trueNegative: number;
    falseNegative: number;
    true: number;
    false: number;
    size: number;
    constructor([tp, fn, fp, tn]: [number, number, number, number]) {
      this.truePositive = tp;
      this.falseNegative = fn;
      this.falsePositive = fp;
      this.trueNegative = tn;
      this.true = tn + tp;
      this.false = fn + fp;
      this.size = this.true + this.false;
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
      return `\n${this.truePositive}\t${this.falseNegative}\n${this.falsePositive}\t${this.trueNegative}`;
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