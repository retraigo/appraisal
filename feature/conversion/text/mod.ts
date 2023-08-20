import { Matrix } from "../../../mod.ts";
import { IndexVectorizer } from "./sparse/index_vectorizer.ts";
import {
  CountVectorizer,
  MultiHotVectorizer,
  TfIdfTransformer,
} from "./sparse/mod.ts";
import {
  DataType,
  TypedArray,
  VectorizerModeConfig,
} from "./types.ts";

export class TextVectorizer {
  vectorizer?: CountVectorizer | MultiHotVectorizer | IndexVectorizer;
  transformer?: TfIdfTransformer;
  constructor(config: VectorizerModeConfig) {
    switch (config.mode) {
      case "count":
        this.vectorizer = new CountVectorizer(config.config);
        break;
      case "indices":
        // TODOL: impl indices
        this.vectorizer = new IndexVectorizer(config.config);
        break;
      case "multihot":
        this.vectorizer = new MultiHotVectorizer(config.config);
        break;
      case "tfidf":
        this.vectorizer = new CountVectorizer(config.config);
        this.transformer = new TfIdfTransformer(config.config);
    }
  }
  get vocabulary(): string[] {
    if (!this.vectorizer) return [];
    const vocab = this.vectorizer.vocabulary;
    const res = new Array(vocab.size);
    for (const word of vocab.keys()) {
      const idx = vocab.get(word);
      if (typeof idx !== "number") {
        throw new Error(
          "This is never supposed to happen. If it does, open an issue.",
        );
      }
      res[idx] = word;
    }
    return res;
  }
  fit(
    text: string | string[],
    dType: DataType,
  ): this {
    this.vectorizer?.fit(text);
    if (this.transformer) {
      // @ts-ignore If transformer exists, vectorizer will exist
      const vec = this.vectorizer.transform(text, dType);
      this.transformer.fit(vec);
    }
    return this;
  }
  transform<T extends TypedArray>(
    text: string | string[],
    dType: DataType,
  ): Matrix<T> {
    if (!this.vectorizer) {
      throw new Error("This is an empty vectorizer!");
    }
    const vec = this.vectorizer.transform<T>(text, dType);
    if (this.transformer) {
      return this.transformer.transform(vec);
    }
    return vec;
  }
}
