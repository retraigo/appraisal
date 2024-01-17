import { Matrix, getConstructor } from "../mod.ts";
import { DataType, TypedArray } from "../utils/common_types.ts";

export class CategoricalEncoder<T> {
  /** Map categories to indices */
  mapping: Map<T, number>;
  /** An internal counter for remembering the last index in mapping. */
  #lastToken: Uint32Array;
  constructor() {
    this.mapping = new Map();
    this.#lastToken = new Uint32Array(1);
  }
  /** Construct a mapping from a given set of text. */
  fit(targets: T[]): this {
    let i = 0;
    while (i < targets.length) {
      if (!this.mapping.has(targets[i])) {
        const token = this.#incrementToken();
        console.log(token);
        this.mapping.set(targets[i], token);
      }
      i += 1;
    }
    return this;
  }
  /** One-hot encoding of categorical values */
  transform<DT extends TypedArray>(targets: T[], dType: DataType): Matrix<DT> {
    const data = new (getConstructor(dType))(this.#lastToken[0] * targets.length)
    const res = new Matrix<DT>(data as DT, [
      this.#lastToken[0]
    ]);
    let i = 0;
    while (i < targets.length) {
      const index = this.mapping.get(targets[i]);
      if (index !== 0 && !index) {
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
