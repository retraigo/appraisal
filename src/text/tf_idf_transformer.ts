/** Return a matrix of document frequencies of each term in an array of TF features. */
export function countFrequency(data: ArrayLike<number>[]): Float32Array {
  const freq = new Float32Array(data[0].length);
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

/** Construct a sparse matrix from given diagonals. */
export function spFromDiags(
  diags: ArrayLike<number>,
  size: number,
): Float32Array[] {
  const res = new Array(size);
  let i = 0;
  while (i < size) {
    res[i] = new Float32Array(size);
    res[i][i] = diags[i];
    i += 1;
  }
  return res;
}

/** Convert tf features (CountVectorizer) into tf-idf features. */
export class TfIdfTransformer {
  idf: null | Float32Array[];
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

    const idf = new Float32Array(freq.length);

    let i = 0;
    while (i < idf.length) {
      idf[i] = Math.log(shape.samples / freq[i]) + 1;
      i += 1;
    }
    this.idf = spFromDiags(idf, shape.features);
    return this;
  }
  /** 
   * Transform an tf features into tf-idf features. 
   * Warning: Currently extremely slow. If you have a fast matrix multiplication
   * method, consider using that to multiply `data` and `TfIdfTransformer.idf`.
   */
  transform(data: ArrayLike<number>[]): Float32Array[] {
    if (this.idf === null) throw new Error("IDF not initialized yet.");
    return matMul(data, this.idf);
  }
}

/** A very basic, low-effort matrix multiplication. */
export function matMul(x: ArrayLike<number>[], y: ArrayLike<number>[]): Float32Array[] {
  const res = new Array(x.length);
  let i = 0;
  while (i < x.length) {
    res[i] = new Float32Array(y.length)
    let j = 0;
    while (j < y.length) {
      let k = 0;
      while (k < y.length) {
        res[i][j] += x[i][k] * y[k][j];
        k += 1;
      }
      j += 1;
    }
    i += 1;
  }
  return res;
}
