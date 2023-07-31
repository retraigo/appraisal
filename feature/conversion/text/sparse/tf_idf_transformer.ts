import { Matrix } from "../../../utils/matrix.ts";

/** Convert tf features (CountVectorizer) into tf-idf features. */
export class TfIdfTransformer {
  idf: null | Float64Array;
  constructor() {
    this.idf = null;
  }
  /** Get idf matrix from tf features. */
  fit(data: Matrix<Float32Array>): TfIdfTransformer {
    const shape = {
      features: data.nCols,
      samples: data.nRows,
    };
    const freq = data.rowSum();

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
  transform(data: Matrix<Float32Array>): Matrix<Float32Array> {
    if (this.idf === null) throw new Error("IDF not initialized yet.");
    return multiplyDiags(data, this.idf);
  }
}

/** A very basic, low-effort multiplication. */
export function multiplyDiags(
  x: Matrix<Float32Array>,
  y: Float64Array,
): Matrix<Float32Array> {
  const res = new Matrix(new Float32Array(x.data.length), x.shape);
  let i = 0;
  while (i < x.nRows) {
    let j = 0;
    while (j < y.length) {
      res.setCell(i, j, x.item(i, j) * y[j]);
      j += 1;
    }
    i += 1;
  }
  return res;
}
