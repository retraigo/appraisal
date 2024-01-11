import { Matrix } from "../mod.ts";

export class CategoricalEncoder<T> {
  /** Map categories to indices */
  vocabulary: Map<T, number>;
  /** An internal counter for remembering the last index in vocabulary. */
  #lastToken: Uint32Array;
  constructor() {
    this.vocabulary = new Map();
    this.#lastToken = new Uint32Array(0);
  }
  /** Construct a vocabulary from a given set of text. */
  fit(targets: T[]): this {
    let i = 0;
    while (i < targets.length) {
      if (!this.vocabulary.has(targets[i])) {
        const token = this.#incrementToken();
        this.vocabulary.set(targets[i], token);
      }
      i += 1;
    }
    return this;
  }
  /** One-hot encoding of categorical values */
  transform(targets: T[]): Matrix<Uint8Array> {
    const res = new Matrix(Uint8Array, [this.#lastToken[0], targets.length]);
    let i = 0;
    while (i < targets.length) {
      const index = this.vocabulary.get(targets[i]);
      if (!index) {
        i += 1;
        continue;
      }
      res.setCell(i, index, 1);
      i += 1;
    }
    return res;
  }
  #incrementToken(): number {
    return Atomics.add(this.#lastToken, 0, 1);
  }
}
