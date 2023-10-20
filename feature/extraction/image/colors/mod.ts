import { Image } from "../../../../utils/mod.ts";
import { quantizeByMedianCut } from "./median_cut.ts";

export function extractColors(image: Image, nColors: number) {
  return quantizeByMedianCut(image, nColors, 5);
}

export { getHistogram } from "./histogram.ts";
export { Image };
