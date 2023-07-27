import { Matrix } from "./src/utils/matrix.ts";

const d = new Matrix(new Float32Array([1, 2, 3, 4, 5, 6, 7, 8]), [4, 2])

console.log(d.rowSum())