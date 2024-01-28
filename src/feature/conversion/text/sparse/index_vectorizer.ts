import { BaseVectorizer, type BaseVectorizerOptions } from "../base.ts";
import { DataType } from "../../../../utils/common_types.ts";
import { getConstructor } from "../../../../utils/mod.ts";
import { Matrix } from "../../../../mod.ts";
import { DType } from "../../../../utils/common_types.ts";

/**
 * Convert text into vectors (bag of words)
 */
export class IndexVectorizer extends BaseVectorizer {
  size: number | null;
  constructor(options: Partial<BaseVectorizerOptions & { size: number }> = {}) {
    super({ ...options, indices: true });
    this.size = options.size ?? null;
  }
  /**
   * Convert a document (string | array of strings) into vectors.
   */
  transform<T extends DataType>(
    text: string | string[],
    dType: T,
  ): Matrix<T> {
    if (!this.vocabulary.size) {
      throw new Error(
        "IndexVectorizer vocabulary not initialized yet. Call `new IndexVectorizer()` with a custom vocabulary or use `.fit()` on an array of text.",
      );
    }
    if (Array.isArray(text)) {
      const size = Math.max(...text.map((x) => this.split(x).length));
      const res = new Matrix(
        new (getConstructor(dType))(text.length * size),
        [text.length, size],
      );
      let i = 0;
      while (i < text.length) {
        res.setRow(i, this.#transform<T>(text[i], size, dType));
        i += 1;
      }
      return res as Matrix<T>;
    } else {
      return new Matrix(this.#transform<T>(text, -1, dType), [
        1,
        this.vocabulary.size,
      ]);
    }
  }
  #transform<T extends DataType>(text: string, size: number, dType: T): DType<T> {
    text = this.preprocess(text);
    const words = text.split(" ");
    if (!size) size = words.length;
    const res = new (getConstructor(dType))(size);
    // @ts-ignore idk honestly
    res.fill(typeof res[0] === "bigint" ? BigInt(this.vocabulary.get("__pad__") || 0) : (this.vocabulary.get("__pad__") || 0));
    let i = 0;
    while (i < words.length && i < size) {
      if (this.vocabulary.has(words[i])) {
        const index = this.vocabulary.get(words[i]);
        if (typeof index === "number") {
          // @ts-ignore No error here
          res[i] = typeof res[i] === "bigint" ? BigInt(index) : index;
        } else {
          res[i] = typeof res[i] === "bigint"
            ? BigInt(this.vocabulary.get("__unk__") || 0)
            : (this.vocabulary.get("__unk__") || 0);
          }
      } else {
        res[i] = typeof res[i] === "bigint"
            ? BigInt(this.vocabulary.get("__unk__") || 0)
            : (this.vocabulary.get("__unk__") || 0);
      }
      i += 1;
    }
    return res as DType<T>;
  }
}
