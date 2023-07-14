import { patch2d } from "./src/image/patch_2d.ts";
import { Image2d } from "./src/types.ts";

const image: Image2d = {
    width: 3,
    height: 4,
    channels: 2,
    data: new Uint8ClampedArray([
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
      22,
      23,
      24,
    ]),
  };
  
  const res = patch2d(image, { width: 2, height: 2 });
  
  const patches = new Array(res.size);
  const patchArea = 4 * image.channels;
  for (let i = 0; i < res.size; ++i) {
    patches[i] = res.data.slice(i * patchArea, (i + 1) * patchArea);
  }
  console.log(patches)