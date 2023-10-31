import { CardRenderer } from "./card_renderer";
import { getApp } from "../app";
import { Tools } from "@babylonjs/core";
import {
  CardTextureGenerator,
  CardTextureGeneratorOptions,
} from "./card_texture_generator";
import { loadImage } from "../utils/img_utils";

export interface CardOptions {
  title: string;
  description: string;
  illustrationUrl?: string;
  manaCost: number;
}

export abstract class Card {
  renderer: CardRenderer | null = null;
  title: string;
  description: string;
  illustrationUrl: string | undefined;
  manaCost: number;
  private textureGenerator: CardTextureGenerator | null = null;
  private imageElement: HTMLImageElement | null = null;
  static illustrations = new Map<string, Promise<HTMLImageElement>>();

  constructor(private readonly options: CardOptions) {
    this.title = options.title;
    this.description = options.description;
    this.illustrationUrl = options.illustrationUrl;
    this.manaCost = options.manaCost;
  }

  async initializeRenderer() {
    if (this.illustrationUrl) {
      await this.loadIllustration();
    }
    this.renderer = await CardRenderer.createCard(
      getApp().scene,
      this.getTextureGenerator()
    );
  }

  async play(): Promise<void> {
    console.warn(`play unimplemented for ${this.options.title}`);
    await Tools.DelayAsync(500);
  }

  getTextureGenerator(): CardTextureGenerator {
    if (!this.textureGenerator) {
      this.textureGenerator = new CardTextureGenerator(
        getApp().scene,
        this.getTextureGeneratorOptions()
      );
    }
    return this.textureGenerator;
  }

  getTextureGeneratorOptions(): CardTextureGeneratorOptions {
    return {
      title: this.title,
      description: this.description,
      img: this.imageElement ?? undefined,
    };
  }

  /** Grab the image if it already exists, or create it. */
  async loadIllustration(): Promise<HTMLImageElement> {
    const existing = Card.illustrations.get(this.title);
    if (existing) {
      this.imageElement = await existing;
      return existing;
    } else {
      const load = loadImage(this.illustrationUrl!);
      Card.illustrations.set(this.title, load);
      this.imageElement = await load;
      return load;
    }
  }

  dispose() {
    this.renderer?.dispose();
    this.renderer = null;
    this.textureGenerator = null;
  }
}
