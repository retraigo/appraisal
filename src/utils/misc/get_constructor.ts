import { DataType } from "../common_types.ts";

export function getConstructor(dType: DataType) {
  switch (dType) {
    case "u8":
      return Uint8Array;
    case "u16":
      return Uint16Array;
    case "u32":
      return Uint32Array;
    case "u64":
      return BigUint64Array;
    case "i8":
      return Int8Array;
    case "i16":
      return Int16Array;
    case "i32":
      return Int32Array;
    case "i64":
      return BigInt64Array;
    case "f32":
      return Float32Array;
    case "f64":
      return Float64Array;
  }
}
