import { DefaultIgnoreList } from "../../../constants/stop_words.ts";
import { StandardizeConfig } from "./types.ts";

export function preprocess(
  text: string,
  { stripHtml = false, lowercase = false, normalizeWhitespaces = true },
): string {
  if (lowercase) {
    text = text.toLowerCase();
  }
  if (stripHtml) {
    text = text.replace(/<([^>]+)>/g, " ");
  }
  if (normalizeWhitespaces) {
    text = text.replace(/\s\s+/g, " ");
  }
  return text;
}

export type BaseVectorizerOptions = {
  /** Map words to indices */
  vocabulary: Map<string, number>;
  /** Options for standardizing text */
  standardize: StandardizeConfig | ((s: string) => string);
  /** Words to ignore from vocabulary */
  skipWords: "english" | false | string[];
};

export class BaseVectorizer implements BaseVectorizerOptions {
  /** Words to ignore from vocabulary */
  skipWords: "english" | false | string[];
  /** Configuration / Function for preprocessing */
  standardize: StandardizeConfig | ((s: string) => string);
  /** Map words to indices */
  vocabulary: Map<string, number>;
  /** An internal counter for remembering the last index in vocabulary. */
  #lastToken: Uint32Array;
  constructor(options: Partial<BaseVectorizerOptions>) {
    this.skipWords = options.skipWords ?? false;
    this.standardize = typeof options.standardize === "function"
      ? options.standardize
      : {
        lowercase: options.standardize?.lowercase ?? true,
        stripHtml: options.standardize?.stripHtml ?? false,
        normalizeWhiteSpaces: options.standardize?.normalizeWhiteSpaces ?? true,
      };
    this.vocabulary = options.vocabulary ?? new Map();
    this.#lastToken = new Uint32Array(1);
    if (this.vocabulary.size) {
      this.#lastToken[0] = this.vocabulary.size;
    }
  }
  get lastToken(): number {
    return Atomics.load(this.#lastToken, 0);
  }
  /** Construct a vocabulary from a given set of text. */
  fit(
    text: string | string[],
  ): this {
    if (Array.isArray(text)) {
      let i = 0;
      while (i < text.length) {
        this.fit(text[i]);
        i += 1;
      }
    } else {
      text = this.preprocess(text);
      const words = this.split(text);
      let i = 0;
      while (i < words.length) {
        if (!this.vocabulary.has(words[i])) {
          if (this.skipWords === "english") {
            if (DefaultIgnoreList.includes(words[i])) {
              i += 1;
              continue;
            }
          } else if (Array.isArray(this.skipWords)) {
            if (this.skipWords.includes(words[i])) {
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
  #incrementToken(): number {
    return Atomics.add(this.#lastToken, 0, 1);
  }
  preprocess(text: string): string {
    return typeof this.standardize === "function"
      ? this.standardize(text)
      : preprocess(text, this.standardize);
  }
  // TODO: Support custom split modes
  split(text: string): string[] {
    return text.split(" ")
  }
}
