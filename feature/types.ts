export interface Image2d {
  /** Width of the image */
  width: number;
  /** Height of the image */
  height: number;
  /**
   * Number of channels in the image
   * For a regular RGBA image, the value
   * will be 4.
   */
  channels: number;
  /** Array of length width * height * channels */
  data: Uint8ClampedArray;
}

export interface Patch2d {
  /** Width of the patch */
  width: number;
  /** Height of the patch */
  height: number;
}
export interface PatchCollection extends Patch2d {
  /**
   * Number of channels in the image
   * For a regular RGBA image, the value
   * will be 4.
   */
  channels: number;
  /** Number of patches in the collection */
  size: number;
  data: Uint8ClampedArray;
}
