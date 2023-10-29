import { CardRenderer } from "./card_renderer";
import { getApp } from "../app";
import { Tools } from "@babylonjs/core";

export interface CardOptions {
  title: string;
  description: string;
}

export abstract class Card {
  renderer: CardRenderer | null = null;
  title: string;
  description: string;

  constructor(options: CardOptions) {
    this.title = options.title;
    this.description = options.description;
  }

  async initializeRenderer() {
    this.renderer = await CardRenderer.createCard(getApp().scene, {
      title: this.title,
      description: this.description,
    });
  }

  async play(): Promise<void> {
    console.warn(`play unimplemented for ${this.title}`);
    await Tools.DelayAsync(500);
  }

  dispose() {
    this.renderer?.dispose();
    this.renderer = null;
  }
}
