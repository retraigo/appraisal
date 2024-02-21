import type {
  Vectorizer,
  Tokenizer,
  Cleaner,
  Transformer,
} from "../../utils/common_types.ts";

// import { TextCleaner } from "./cleaner.ts";
// import { SplitTokenizer } from "./tokenize/mod.ts";
// import { CountVectorizer } from "./vectorize/mod.ts";
// import { TfIdfTransformer } from "./transformer/mod.ts";

type PreprocessorConfig = {
  vectorizer: Vectorizer;
  tokenizer: Tokenizer;
  cleaner: Cleaner;
  transformer: Transformer;
};

export class TextPreprocessor implements Partial<PreprocessorConfig> {
  // todo
}

export * from "./cleaner.ts";
export * from "./tokenize/mod.ts";
export * from "./transformer/mod.ts";
export * from "./vectorize/mod.ts";
