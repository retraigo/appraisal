import {
  DataType,
  DType,
  DTypeValue,
  getDataType,
  Sliceable,
} from "../common_types.ts";
import { getConstructor } from "./get_constructor.ts";

export enum Order {
  /** A collection of scalars */
  Vector = 1,
  Matrix = 2,
  T3 = 3,
  T4 = 4,
  T5 = 5,
}

export type TensorLike<DT extends DataType, O extends Order> = {
  data: DType<DT>;
  shape: Shape<O>;
};

export type Shape<N extends number> = N extends 0
  ? []
  : [number, ...number[]] & { length: N };

export type NDArray<DT extends DataType> = {
  1: DTypeValue<DT>[];
  2: DTypeValue<DT>[][];
  3: DTypeValue<DT>[][][];
  4: DTypeValue<DT>[][][][];
  5: DTypeValue<DT>[][][][][];
};

function getShape<O extends Order, DT extends DataType>(
  arr: NDArray<DT>[O]
): Shape<O> {
  const shape: number[] = [];
  let curr: NDArray<DT>[O] | DTypeValue<DT> = arr;
  while (Array.isArray(curr)) {
    shape.push(curr.length);
    curr = curr[0] as NDArray<DT>[O] | DTypeValue<DT>;
  }
  return shape as Shape<O>;
}

/**
 * A Tensor of order O.
 */
export class Tensor<DT extends DataType, O extends Order>
  implements Sliceable, TensorLike<DT, O>
{
  order: O;
  shape: Shape<O>;
  data: DType<DT>;
  strides: Shape<O>;
  dType: DT;
  constructor(array: NDArray<DT>[O], shape: undefined, dType: DT);
  constructor(data: DType<DT>, shape: Shape<O>);
  constructor(dType: DT, shape: Shape<O>);
  constructor(
    data: NDArray<DT>[O] | DType<DT> | DT,
    shape?: Shape<O>,
    dType?: DT
  ) {
    if (typeof data === "string") {
      if (!shape)
        throw new Error(`Expected shape to be defined. Got ${shape}.`);
      else {
        this.data = new (getConstructor(data))(
          shape.reduce((acc, val) => acc * val, 1)
        ) as DType<DT>;
        this.shape = shape;
        this.order = shape.length as O;
        this.dType = data;
        this.strides = Tensor.getStrides(this.shape);
      }
    } else if (Array.isArray(data)) {
      if (!dType)
        throw new Error(
          `Expected dType to be defined when using a normal array. Got ${dType}.`
        );
      else {
        this.shape = getShape(data);
        this.order = this.shape.length as O;
        // @ts-ignore They're mapped correctly
        this.data = getConstructor(dType).from(
          data.flat(this.shape.length) as DTypeValue<DT>[]
        ) as DType<DT>;
        this.dType = dType;
        this.strides = Tensor.getStrides(this.shape);
      }
    } else if (ArrayBuffer.isView(data)) {
      if (!shape)
        throw new Error(
          `Shape must be defined when Tensor is constructed from a TypedArray.`
        );
      this.shape = shape;
      this.order = this.shape.length as O;
      this.data = data;
      this.dType = getDataType(data);
      this.strides = Tensor.getStrides(this.shape);
    } else {
      throw new Error("Tensor initialization does not follow any overload.");
    }
  }
  /** For compat with useSplit() */
  get length(): number {
    return this.shape[0];
  }
  /** Filter the tensor by 0th axis */
  filter(
    fn: (value: DType<DT>, row: number, _: DType<DT>[]) => boolean
  ): Tensor<DT, O> {
    const satisfying: number[] = [];
    let i = 0;
    const stride = this.strides[0];
    while (i < this.shape[0]) {
      if (
        fn(this.data.slice(stride * i, stride * (i + 1)) as DType<DT>, i, [])
      ) {
        satisfying.push(i);
      }
      i += 1;
    }
    const res = new Tensor<DT, O>(this.dType, [
      satisfying.length,
      ...this.shape.slice(1),
    ] as Shape<O>);
    i = 0;
    while (i < satisfying.length) {
      res.data.set(
        // @ts-ignore This line will work
        this.data.slice(stride * satisfying[i], stride * (satisfying[i] + 1)),
        i
      );
      i += 1;
    }
    return res;
  }
  /** Slice matrix by axis */
  slice(start = 0, end?: number, axis = 0): Tensor<DT, O> {
    if (axis > this.strides.length - 1)
      throw new Error(
        `Axis given is ${axis} while highest axis is ${
          this.strides.length - 1
        }.`
      );
    if (!end) end = this.shape[axis] - start;
    const stride = this.strides[axis - 1] || this.length;
    const newStride = (stride / this.shape[axis]) * (end - start);
    const res = new Tensor<DT, O>(this.dType, [
      ...this.shape.slice(0, axis),
      end - start,
      ...this.shape.slice(axis + 1),
    ] as Shape<O>);
    for (let i = 0; i < this.length / stride; i += 1) {
      // @ts-ignore The values will always match
      res.data.set(
        // @ts-ignore The values will always match
        this.data
          .slice(stride * i, stride * (i + 1))
          .slice(start * this.strides[axis], end * this.strides[axis]),
        newStride * i
      );
    }
    return res;
  }
  toJSON() {
    return {
      // @ts-ignore I have no idea why TS is doing this
      data: Array.from(this.data) as DTypeValue<DT>[],
      shape: this.shape,
    };
  }
  /** Iterate along the first axis */
  *iter(): Generator<DType<DT>> {
    let i = 0;
    const stride = this.strides[0]
    while (i < this.data.length) {
      yield this.data.slice(i * stride, (i + 1) * stride) as DType<DT>;
      i += 1;
    }
  }

  static getStrides<O extends Order>(shape: Shape<O>): Shape<O> {
    const strides = new Array(shape.length).fill(1);
    for (let i = 0; i < shape.length; i += 1) {
      strides[i] = shape.slice(i + 1).reduce((acc, val) => acc * val, 1);
    }
    return strides as Shape<O>;
  }
}

console.log(
  new Tensor(
    [
      [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
      ],
      [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
      ],
    ],
    undefined,
    "u8"
  ).slice(0, 2, 1)
);
