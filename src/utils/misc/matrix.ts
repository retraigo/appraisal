import {
  DataType,
  TypedArray,
  DType,
  DTypeConstructor,
  DTypeValue,
  AddDTypeValues,
  Sliceable
} from "../common_types.ts";

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

/**
 * Class for 2D Arrays.
 * This is not akin to a mathematical Matrix (a collection of column vectors).
 * This is a collection of row vectors.
 */
export class Matrix<T extends DataType> implements Sliceable {
  /** Type of data in the matrix */
  dType: DataType;
  /** Number of rows in the matrix */
  nRows: number;
  /** Number of columns in the matrix */
  nCols: number;
  /** Raw 1D TypedArray supplied */
  data: DType<T>;
  /**
   * Create a matrix from a typed array
   * @param data Data to move into the matrix.
   * @param shape [rows, columns] of the matrix.
   */
  constructor(data: DType<T> | DTypeConstructor<T>, shape: [number, number?]) {
    this.nRows = this.nCols = 0;
    // Check if it is an actual array
    if (ArrayBuffer.isView(data)) {
      this.data = data;
      this.dType = getDataType(data);
      this.nRows = shape[0];
      this.nCols =
        typeof shape[1] === "number" ? shape[1] : this.data.length / shape[0];
    } else {
      // if not, construct a new one
      if (typeof shape[1] !== "number") {
        throw new Error("Cannot initialize with incomplete shape (n-cols)");
      }
      this.nRows = shape[0];
      this.nCols = shape[1];
      this.data = new data(shape[0] * shape[1]) as DType<T>;
      this.dType = getDataType(this.data);
    }
  }
  get length(): number {
    return this.nRows;
  }
  /** Returns [rows, columns] */
  get shape(): [number, number] {
    return [this.nRows, this.nCols];
  }
  /** Get the transpose of the matrix. This method clones the matrix. */
  get T(): Matrix<T> {
    const resArr = new (this.data.constructor as DTypeConstructor<T>)(
      this.nRows * this.nCols
    ) as DType<T>;
    let i = 0;
    for (const col of this.cols()) {
      // @ts-ignore This line will work
      resArr.set(col, i * this.nRows);
      i += 1;
    }
    return new Matrix(resArr, [this.nCols, this.nRows]);
  }
  /** Get a pretty version for printing. DO NOT USE FOR MATRICES WITH MANY COLUMNS. */
  get pretty(): string {
    let res = "";
    for (const row of this.rows()) {
      res += row.join("\t");
      res += "\n";
    }
    return res;
  }
  /** Alias for row */
  at(pos: number): DType<T> {
    return this.row(pos);
  }
  /** Get the nth column in the matrix */
  col(n: number): DType<T> {
    let i = 0;
    const col = new (this.data.constructor as DTypeConstructor<T>)(
      this.nRows
    ) as DType<T>;
    let offset = 0;
    while (i < this.nRows) {
      col[i] = this.data[offset + n];
      i += 1;
      offset += this.nCols;
    }
    return col;
  }
  colMean(): DType<T> {
    const sum = this.colSum();
    let i = 0;
    const divisor = (
      typeof this.data[0] === "bigint" ? BigInt(this.nCols) : this.nCols
    ) as DTypeValue<T>;
    while (i < sum.length) {
      sum[i] = (sum[i] as DTypeValue<T>) / divisor;
      i += 1;
    }
    return sum;
  }
  /** Get a column array of all column sums in the matrix */
  colSum(): DType<T> {
    const sum = new (this.data.constructor as DTypeConstructor<T>)(
      this.nRows
    ) as DType<T>;
    let i = 0;
    while (i < this.nCols) {
      let j = 0;
      while (j < this.nRows) {
        // @ts-ignore I'll fix this later
        sum[j] = sum[j] + this.item(j, i) as AddDTypeValues<DTypeValue<T>, DTypeValue<T>>;
        j += 1;
      }
      i += 1;
    }
    return sum;
  }
  /** Get the dot product of two matrices */
  dot(rhs: Matrix<T>): number | bigint {
    if (rhs.nRows !== this.nRows) {
      throw new Error("Matrices must have equal rows.");
    }
    if (rhs.nCols !== this.nCols) {
      throw new Error("Matrices must have equal cols.");
    }
    let res = (typeof this.data[0] === "bigint" ? 0n : 0) as DTypeValue<T>;
    let j = 0;
    while (j < this.nCols) {
      let i = 0;
      while (i < this.nRows) {
        const adder = (this.item(i, j) as DTypeValue<T>) * (rhs.item(i, j) as DTypeValue<T>);
        // @ts-ignore I'll fix this later
        res += adder as DTypeValue<T>
        i += 1;
      }
      j += 1;
    }
    return res;
  }
  /** Filter the matrix by rows */
  filter(
    fn: (value: DType<T>, row: number, _: DType<T>[]) => boolean
  ): Matrix<T> {
    const satisfying: number[] = [];
    let i = 0;
    while (i < this.nRows) {
      if (fn(this.row(i), i, [])) {
        satisfying.push(i);
      }
      i += 1;
    }
    const matrix = new Matrix(this.data.constructor as DTypeConstructor<T>, [
      satisfying.length,
      this.nCols,
    ]);
    i = 0;
    while (i < satisfying.length) {
      // @ts-ignore This line will work
      matrix.setRow(i, this.row(satisfying[i]));
      i += 1;
    }
    return matrix;
  }
  /** Get an item using a row and column index */
  item(row: number, col: number): DTypeValue<T> {
    return this.data[row * this.nCols + col] as DTypeValue<T>;
  }
  /** Get the nth row in the matrix */
  row(n: number): DType<T> {
    return this.data.slice(n * this.nCols, (n + 1) * this.nCols) as DType<T>;
  }
  rowMean(): DType<T> {
    const sum = this.rowSum();
    let i = 0;
    const divisor = (
      typeof this.data[0] === "bigint" ? BigInt(this.nRows) : this.nRows
    ) as DTypeValue<T>;
    while (i < sum.length) {
      sum[i] = (sum[i] as DTypeValue<T>) / divisor;
      i += 1;
    }
    return sum;
  }
  /** Compute the sum of all rows */
  rowSum(): DType<T> {
    const sum = new (this.data.constructor as DTypeConstructor<T>)(
      this.nCols
    ) as DType<T>;
    let i = 0;
    let offset = 0;
    while (i < this.nRows) {
      let j = 0;
      while (j < this.nCols) {
        // @ts-ignore This line will work
        sum[j] += this.data[offset + j];
        j += 1;
      }
      i += 1;
      offset += this.nCols;
    }
    return sum;
  }
  /**
   * Add a value to an existing element
   * Will throw an error if the types mismatch
   */
  setAdd(row: number, col: number, val: number | bigint) {
    // @ts-expect-error Must provide appropriate number/bigint argument
    this.data[row * this.nCols + col] += val;
  }
  /** Replace a column */
  setCol(col: number, val: ArrayLike<number>) {
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
  setRow(row: number, val: ArrayLike<number> | ArrayLike<bigint>) {
    // @ts-expect-error Must provide appropriate number/bigint argument
    this.data.set(val, row * this.nCols);
  }
  /** Slice matrix by rows */
  slice(start = 0, end?: number): Matrix<T> {
    return new Matrix<T>(
      this.data.slice(
        start ? start * this.nCols : 0,
        end ? end * this.nCols : undefined
      ) as DType<T>,
      [end ? end - start : this.nRows - start, this.nCols]
    );
  }
  /** Iterate through rows */
  *rows(): Generator<DType<T>> {
    let i = 0;
    while (i < this.nRows) {
      yield this.data.slice(i * this.nCols, (i + 1) * this.nCols) as DType<T>;
      i += 1;
    }
  }
  /** Iterate through columns */
  *cols(): Generator<DType<T>> {
    let i = 0;
    while (i < this.nCols) {
      let j = 0;
      const col = new (this.data.constructor as DTypeConstructor<T>)(
        this.nRows
      ) as DType<T>;
      while (j < this.nRows) {
        col[j] = this.data[j * this.nCols + i];
        j += 1;
      }
      yield col;
      i += 1;
    }
  }

  [Symbol.for("Jupyter.display")]() {
    let res = "<table>\n";
    res += "<thead><tr><th>idx</th>";
    for (let i = 0; i < this.nCols; i += 1) {
      res += `<th>${i}</th>`;
    }
    res += "</tr></thead>";
    let j = 0;
    for (const row of this.rows()) {
      res += `<tr><td><strong>${j}</strong></td>`;
      j += 1;
      for (const x of row) {
        res += `<td>${x}</td>`;
      }
      res += "</tr>";
    }
    res += "</table>";
    return {
      // Plain text content
      "text/plain": this.pretty,

      // HTML output
      "text/html": res,
    };
  }
}
