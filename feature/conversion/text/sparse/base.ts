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

export interface BaseVectorizerOptions {
  /** Whether to convert everything to lowercase before fitting / transforming */
  lowercase?: boolean;
  /** An array of words to ignore. */
  stopWords?: "english" | false | string[];
  /** Whether to strip HTML tags */
  stripHtml?: boolean;
  /** Whether to replace multiple whitespaces. */
  normalizeWhiteSpaces?: boolean;
}

export class BaseVectorizer {
  lowercase?: boolean;
  stopWords?: "english" | false | string[];
  stripHtml?: boolean;
  normalizeWhiteSpaces?: boolean;
  constructor(
    {
      lowercase = false,
      stopWords = false,
      stripHtml = false,
      normalizeWhiteSpaces = true,
    }: BaseVectorizerOptions,
  ) {
    this.lowercase = lowercase;
    this.stopWords = stopWords;
    this.stripHtml = stripHtml;
    this.normalizeWhiteSpaces = normalizeWhiteSpaces;
  }
}
