export function preprocess(
  text: string,
  { stripHtml = false, lowercase = false, normalizeWhitespaces = true },
) {
  if (lowercase) {
    text = text.toLowerCase();
  }
  if (stripHtml) {
    text = text.replace(/<([^>]+)>/g, " ");
  }
  if (normalizeWhitespaces) {
    text = text.replace(/\s\s+/g, " ");
  }
}

export interface BaseVectorizerOptions {
  lowercase?: boolean;
  stopWords?: "english" | false | string[];
  stripHtml?: boolean;
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
