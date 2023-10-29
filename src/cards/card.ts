import { CardRenderer } from "./card_renderer";
import { getApp } from "../app";
import { Tools } from "@babylonjs/core";
import {
  CardTextureGenerator,
  CardTextureGeneratorOptions,
} from "./card_texture_generator";

export interface CardOptions {
  title: string;
  description: string;
}

export abstract class Card {
  renderer: CardRenderer | null = null;
  title: string;
  description: string;
  private textureGenerator: CardTextureGenerator | null = null;

  constructor(options: CardOptions) {
    this.title = options.title;
    this.description = options.description;
  }

  async initializeRenderer() {
    this.renderer = await CardRenderer.createCard(
      getApp().scene,
      this.getTextureGenerator()
    );
  }

  async play(): Promise<void> {
    console.warn(`play unimplemented for ${this.title}`);
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
    };
  }

  dispose() {
    this.renderer?.dispose();
    this.renderer = null;
    this.textureGenerator = null;
  }
}
