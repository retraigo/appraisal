/** Return a matrix of document frequencies of each term in an array of TF features. */
export function countFrequency(data: ArrayLike<number>[]): Float64Array {
  const freq = new Float64Array(data[0].length);
  let i = 0;
  while (i < data.length) {
    let j = 0;
    while (j < data[i].length) {
      freq[j] += data[i][j];
      j += 1;
    }
    i += 1;
  }
  return freq;
}

/** Convert tf features (CountVectorizer) into tf-idf features. */
export class TfIdfTransformer {
  idf: null | Float64Array;
  constructor() {
    this.idf = null;
  }
  /** Get idf matrix from tf features. */
  fit(data: ArrayLike<number>[]): TfIdfTransformer {
    const shape = {
      features: data[0].length,
      samples: data.length,
    };
    const freq = countFrequency(data);

    const idf = new Float64Array(freq.length);

    let i = 0;
    while (i < idf.length) {
      idf[i] = Math.log(shape.samples / freq[i]) + 1;
      i += 1;
    }
    this.idf = idf;
    return this;
  }
  /** 
   * Transform an tf features into tf-idf features. 
   */
  transform(data: ArrayLike<number>[]): Float64Array[] {
    if (this.idf === null) throw new Error("IDF not initialized yet.");
    return multiplyDiags(data, this.idf);
  }
}

/** A very basic, low-effort multiplication. */
export function multiplyDiags(x: ArrayLike<number>[], y: ArrayLike<number>): Float64Array[] {
  const res = new Array(x.length);
  let i = 0;
  while (i < x.length) {
    res[i] = new Float64Array(y.length)
    let j = 0;
    while (j < y.length) {
      res[i][j] = x[i][j] * y[j]
      j += 1;
    }
    i += 1;
  }
  return res;
}
