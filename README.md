# Appraisal

- Extract / Convert features from Data

## Modules
- [Text Vectorizer](/feature/conversion/text/mod.ts)
- [Color Extractor](/feature/extraction/image/colors/mod.ts)
- [Patch Extractor](/feature/extraction/image/patches/patch_2d.ts)
- [Confusion Matrix](/metrics/confusion_matrix.ts)

## Usage

```ts
const data = [
  "twinkle twinkle little star",
  "How I wonder what you are",
  "up above the world so high",
  "like a diamond in the sky",
];

const vectorizer = new TextVectorizer({
  mode: "tfidf",
  config: { standardize: { lowercase: true } },
});

vectorizer.fit(data, "f32");

const vec = vectorizer.transform(data, "f32");

console.log(vec);
```

<details> 
  <summary>Output</summary>
  <pre>
    <code>
[
  Float64Array(20) [
    3.386294364929199, 2.386294364929199,
    2.386294364929199,                 0,
                    0,                 0,
                    0,                 0,
                    0,                 0,
                    0,                 0,
                    0,                 0,
                    0,                 0,
                    0,                 0,
                    0,                 0
  ],
  Float64Array(20) [
                    0,                 0,
                    0, 2.386294364929199,
    2.386294364929199, 2.386294364929199,
    2.386294364929199, 2.386294364929199,
    2.386294364929199,                 0,
                    0,                 0,
                    0,                 0,
                    0,                 0,
                    0,                 0,
                    0,                 0
  ],
  Float64Array(20) [
                    0,                  0,
                    0,                  0,
                    0,                  0,
                    0,                  0,
                    0,  2.386294364929199,
    2.386294364929199, 1.6931471824645996,
    2.386294364929199,  2.386294364929199,
    2.386294364929199,                  0,
                    0,                  0,
                    0,                  0
  ],
  Float64Array(20) [
                    0,                  0,
                    0,                  0,
                    0,                  0,
                    0,                  0,
                    0,                  0,
                    0, 1.6931471824645996,
                    0,                  0,
                    0,  2.386294364929199,
    2.386294364929199,  2.386294364929199,
    2.386294364929199,  2.386294364929199
  ]
]
    </code>
  </pre>
</details>
