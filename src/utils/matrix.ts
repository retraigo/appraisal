type DataType =
  | "u8"
  | "u16"
  | "u32"
  | "u64"
  | "i8"
  | "i16"
  | "i32"
  | "i64"
  | "f32"
  | "f64";

type TypedArray =
  | Uint8Array
  | Uint16Array
  | Uint32Array
  | Int8Array
  | Int16Array
  | Int32Array
  | Float32Array
  | Float64Array;

type TypedArrayConstructor =
  | Uint8ArrayConstructor
  | Uint16ArrayConstructor
  | Uint32ArrayConstructor
  | Int8ArrayConstructor
  | Int16ArrayConstructor
  | Int32ArrayConstructor
  | Float32ArrayConstructor
  | Float64ArrayConstructor;

function getDataType(data: TypedArray): DataType {
  return data instanceof Uint8Array
    ? "u8"
    : data instanceof Uint16Array
    ? "u16"
    : data instanceof Uint32Array
    ? "u32"
    : data instanceof Int8Array
    ? "i8"
    : data instanceof Int16Array
    ? "i16"
    : data instanceof Int32Array
    ? "i32"
    : data instanceof Float32Array
    ? "f32"
    : data instanceof Float64Array
    ? "f64"
    : "u8"; // shouldn't reach "u8"
}
function getDataConstructor(data: TypedArray): TypedArrayConstructor {
  return data instanceof Uint8Array
    ? Uint8Array
    : data instanceof Uint16Array
    ? Uint16Array
    : data instanceof Uint32Array
    ? Uint32Array
    : data instanceof Int8Array
    ? Int8Array
    : data instanceof Int16Array
    ? Int16Array
    : data instanceof Int32Array
    ? Int32Array
    : data instanceof Float32Array
    ? Float32Array
    : data instanceof Float64Array
    ? Float64Array
    : Uint8Array; // shouldn't reach "u8"
}

/**
 * Class for Matrices
 */
export class Matrix<T extends TypedArray> {
  /** Type of data in the matrix */
  dtype: DataType;
  /** Number of rows in the matrix */
  nRows: number;
  /** Number of columns in the matrix */
  nCols: number;
  /** Raw 1D TypedArray supplied */
  data: T;
  /**
   * Create a matrix from a typed array
   * @param data Data to move into the matrix.
   * @param shape [rows, columns] of the matrix.
   */
  constructor(data: T, shape: [number, number]) {
    /** Type of data held by the matrix */
    this.dtype = getDataType(data);
    /** Number of rows in the matrix */
    this.nRows = shape[0];
    /** Number of columns in the matrix */
    this.nCols = shape[1];
    /** Raw data in the matrix */
    this.data = data;
  }
  /** Returns [rows, columns] */
  get shape(): [number, number] {
    return [this.nRows, this.nCols];
  }
  /** Get the transpose of the matrix. This method clones the matrix. */
  get T(): Matrix<T> {
    const resArr = new (getDataConstructor(this.data))(
      this.nRows * this.nCols,
    ) as T;
    let i = 0;
    for (const col of this.cols()) {
      resArr.set(col, i * this.nRows);
      i += 1;
    }
    return new Matrix(resArr, [this.nCols, this.nRows]);
  }
  /** Get the nth column in the matrix */
  col(n: number): T {
    let i = 0;
    const col = new (getDataConstructor(this.data))(this.nRows) as T;
    while (i < this.nRows) {
      col[i] = this.data[i * this.nCols + n];
      i += 1;
    }
    return col;
  }
  /** Get the dot product of two matrices */
  dot(rhs: Matrix<T>): number {
    if (rhs.nRows !== this.nRows) {
      throw new Error("Matrices must have equal rows.");
    }
    if (rhs.nCols !== this.nCols) {
      throw new Error("Matrices must have equal cols.");
    }

    let res = 0;
    let j = 0;
    while (j < this.nCols) {
      let i = 0;
      while (i < this.nRows) {
        res += this.item(i, j) * rhs.item(i, j);
        i += 1;
      }
      j += 1;
    }
    return res;
  }
  /** Get an item using a row and column index */
  item(row: number, col: number): number {
    return this.data[row * this.nCols + col];
  }
  /** Get the nth row in the matrix */
  row(n: number): T {
    return this.data.slice(n * this.nCols, (n + 1) * this.nCols) as T;
  }
  /** Compute the sum of all rows */
  rowSum(): T {
    const sum = new (getDataConstructor(this.data))(this.nCols) as T;
    let i = 0;
    while (i < this.nRows) {
      let j = 0;
      while (i < this.nCols) {
        sum[j] += this.data[this.nCols * i + j];
        j += 1;
      }
      i += 1;
    }
    return sum;
  }
  /** Add a value to an existing element */
  setAdd(row: number, col: number, val: number) {
    this.data[row * this.nCols + col] += val;
  }
  /** Replace a column */
  setCol(col: number, val: T) {
    let i = 0;
    while (i < this.nRows) {
      this.data[i * this.nCols + col] = val[i];
      i += 1;
    }
    return col;
  }
  /** Set a value in the matrix */
  setCell(row: number, col: number, val: number) {
    this.data[row * this.nCols + col] = val;
  }
  /** Replace a row */
  setRow(row: number, val: T) {
    this.data.set(val, row * this.nCols);
  }
  /** Iterate through rows */
  *rows(): Generator<T> {
    let i = 0;
    while (i < this.nRows) {
      yield this.data.slice(i * this.nCols, (i + 1) * this.nCols) as T;
      i += 1;
    }
  }
  /** Iterate through columns */
  *cols(): Generator<T> {
    let i = 0;
    while (i < this.nCols) {
      let j = 0;
      const col = new (getDataConstructor(this.data))(this.nRows) as T;
      while (j < this.nRows) {
        col[j] = this.data[j * this.nCols + i];
        j += 1;
      }
      yield col;
      i += 1;
    }
  }
}
