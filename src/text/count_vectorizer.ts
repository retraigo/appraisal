import { BaseVectorizer, preprocess } from "./base.ts";
import { DefaultIgnoreList } from "../util.ts";

import type { BaseVectorizerOptions } from "./base.ts";

export interface CountVectorizerOptions extends BaseVectorizerOptions {
  vocabulary?: Map<string, number>;
}

/**
 * Convert text into vectors (bag of words)
 */
export class CountVectorizer extends BaseVectorizer {
  /** Map words to indices */
  vocabulary: Map<string, number>;
  /** An internal counter for remembering the last index in vocabulary. */
  #lastToken: Uint32Array;
  constructor(options: CountVectorizerOptions) {
    super(options);
    this.vocabulary = options.vocabulary ?? new Map();
    this.#lastToken = new Uint32Array(1);
    if(this.vocabulary.size) {
      this.#lastToken[0] = this.vocabulary.size
    }
  }
  get lastToken(): number {
    return Atomics.load(this.#lastToken, 0);
  }
  /** Construct a vocabulary from a given set of text. */
  fit(
    text: string | string[],
  ): CountVectorizer {
    if (Array.isArray(text)) {
      let i = 0;
      while (i < text.length) {
        this.fit(text[i]);
        i += 1;
      }
    } else {
      text = preprocess(text, this)
      const words = text.split(" ");
      let i = 0;
      while (i < words.length) {
        if (!this.vocabulary.has(words[i])) {
          if (this.stopWords === "english") {
            if (DefaultIgnoreList.includes(words[i])) {
              i += 1;
              continue;
            }
          } else if (Array.isArray(this.stopWords)) {
            if (this.stopWords.includes(words[i])) {
              i += 1;
              continue;
            }
          }
          const token = this.#incrementToken();
          this.vocabulary.set(words[i], token);
        }
        i += 1;
      }
    }
    return this;
  }
  /** 
   * Convert a document (string | array of strings) into vectors. 
   * The vectors are Uint32Arrays.
   */
  transform(text: string[]): Uint32Array[];
  transform(text: string): Uint32Array;
  transform(text: string | string[]): Uint32Array | Uint32Array[] {
    if (!this.vocabulary.size) {
      throw new Error(
        "CountVectorizer vocabulary not initialized yet. Call `new CountVectorizer()` with a custom vocabulary or use `.fit()` on an array of text.",
      );
    }
    if (Array.isArray(text)) {
      const res = new Array(text.length);
      let i = 0;
      while (i < text.length) {
        res[i] = this.transform(text[i]);
        i += 1;
      }
      return res;
    } else {
      text = preprocess(text, this)
      const res = new Uint32Array(this.vocabulary.size);
      const words = text.split(" ");
      let i = 0;
      while (i < words.length) {
        if (this.vocabulary.has(words[i])) {
          const index = this.vocabulary.get(words[i]);
          if (typeof index === "number") {
            res[index] += 1;
          }
        }
        i += 1;
      }
      return res;
    }
  }
  #incrementToken(): number {
    return Atomics.add(this.#lastToken, 0, 1);
  }
}
