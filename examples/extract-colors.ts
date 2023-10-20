import {
  createCanvas,
  loadImage,
} from "https://deno.land/x/canvas@v1.4.1/mod.ts";
import { Image, extractColors  } from "../mod.ts";
import { Color } from "../utils/mod.ts";

const image = await loadImage("examples/kagu.png");

const canvas = createCanvas(image.width(), image.height());

const ctx = canvas.getContext("2d");

ctx.drawImage(image, 0, 0);

const data = ctx.getImageData(0, 0, canvas.width, canvas.height);

const img = new Image(data);

const colors = extractColors(img, 1);

const newCan = createCanvas(300, colors.length * 100);

const newCtx = newCan.getContext("2d");

colors.forEach((color, i) => {
  newCtx.fillStyle = new Color(...color).toString();
  newCtx.fillRect(0, i * 100, 300, 100);
});
Deno.writeFile("examples/out.png", newCan.toBuffer("image/png"));
