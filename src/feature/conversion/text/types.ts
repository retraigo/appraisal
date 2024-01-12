import { BaseVectorizerOptions } from "./base.ts";

export type StandardizeConfig = {
  /** Whether to convert everything to lowercase before fitting / transforming */
  lowercase?: boolean;
  /** Whether to strip HTML tags */
  stripHtml?: boolean;
  /** Whether to replace multiple whitespaces. */
  normalizeWhiteSpaces?: boolean;
};

export type VectorizerMode =
  | "count"
  | "indices"
  | "multihot"
  | "tfidf";

export type VectorizerModeConfig = {
  mode: "count";
  config?: Partial<BaseVectorizerOptions>;
} | {
  mode: "indices";
  config?: Partial<BaseVectorizerOptions & { size: number }>;
} | {
  mode: "multihot";
  config?: Partial<BaseVectorizerOptions>;
} | {
  mode: "tfidf";
  config?: Partial<BaseVectorizerOptions & { idf: Float64Array }>;
};
