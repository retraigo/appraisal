import { Image } from "../../../../utils/image.ts";
import { quantizeByMedianCut } from "./median_cut.ts";

export function extractColors(image: Image, nColors: number) {
  return quantizeByMedianCut(image, nColors);
}

export { getHistogram } from "./histogram.ts";
export { Image };
