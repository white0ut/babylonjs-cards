import * as B from "@babylonjs/core";
import { wrapText } from "../utils/canvas_utils";
import { cardTextureSvg } from "../asset_loader";
import { loadImage } from "../utils/img_utils";

export interface CardTextureGeneratorOptions {
  title: string;
  description: string;
  tempGradient?: {
    c1: string;
    c2: string;
  };
  img?: HTMLImageElement;
}

export class CardTextureGenerator {
  private readonly texture: B.DynamicTexture;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly invertY = false;

  private static baseTextureImageElementPromise = loadImage(cardTextureSvg);

  constructor(
    scene: B.Scene,
    private readonly options: CardTextureGeneratorOptions
  ) {
    const canvas = document.createElement("canvas") as HTMLCanvasElement;
    canvas.width = 4096;
    canvas.height = 4096;
    this.texture = new B.DynamicTexture("cardTexture", canvas, scene);
    this.ctx = canvas.getContext("2d")!;

    this.drawAllTheThings();
  }

  async drawAllTheThings(): Promise<void> {
    await this.drawBaseTexture();
    this.drawTitle(this.options.title);
    this.drawIllustration();
    this.drawDescription(this.options.description);
    this.update();
  }

  getTexture(): B.DynamicTexture {
    return this.texture;
  }

  drawTitle(title: string): void {
    this.ctx.font = "200px Comic Sans MS";
    const x = 2945;
    const y = 1500;
    this.ctx.fillStyle = "#000";
    this.ctx.textBaseline = "top";
    this.ctx.textAlign = "center";
    this.ctx.fillText(title, x + 5, y + 10);
    this.ctx.fillStyle = "#fff";
    this.ctx.fillText(title, x, y);
    this.update();
  }

  drawDescription(description: string): void {
    const x = 2945;
    const y = 3050;
    const w = 1800;
    const fontSize = 120;
    this.ctx.font = `${fontSize}px Comic Sans MS`;
    this.ctx.textBaseline = "top";
    this.ctx.textAlign = "center";
    this.ctx.fillStyle = "#000";
    wrapText(this.ctx, description, x, y, w, fontSize * 1.5);
  }

  drawIllustration(): void {
    const x = 2000;
    const y = 1780;
    const w = 1850;
    const h = 1100;

    if (this.options.img) {
      // Save the current clip path.
      this.ctx.save();

      // Set the clip path to the round rectangle.
      this.ctx.roundRect(x, y, w, h, 100);
      this.ctx.clip();

      // Draw the image.
      this.ctx.drawImage(this.options.img, x, y, w, h);

      // Restore the original clip path.
      this.ctx.restore();
    } else {
      const gradient = this.ctx.createLinearGradient(2000, 1800, 3850, 3000);
      gradient.addColorStop(0, "#000");
      gradient.addColorStop(0.33, this.options.tempGradient?.c1 ?? "#ff0");
      gradient.addColorStop(0.5, this.options.tempGradient?.c2 ?? "#fa0");
      gradient.addColorStop(0.67, this.options.tempGradient?.c1 ?? "#ff0");
      gradient.addColorStop(1, "#000");

      this.ctx.fillStyle = gradient;

      this.ctx.roundRect(x, y, w, h, 100);
      this.ctx.fill();
    }
  }

  private async drawBaseTexture() {
    const img = await CardTextureGenerator.baseTextureImageElementPromise;
    this.ctx.drawImage(img, 0, 0, 4096, 4096);
    this.update();
  }

  private update() {
    this.texture.update(this.invertY);
  }
}
