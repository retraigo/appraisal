import { TextVectorizer } from "../mod.ts";

const corpus = [
  "this is the first document",
  "this document is the second document",
  "and this is the third one",
  "is this the first document",
];

const vec = new TextVectorizer({ mode: "indices" });

vec.fit(corpus, "f32");

console.log(Array.from(vec.transform(corpus, "f32").rows()), vec.vocabulary);
