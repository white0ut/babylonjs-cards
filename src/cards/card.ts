import { CardRenderer } from "./card_renderer";
import { getApp } from "../app";
import { Tools } from "@babylonjs/core";

export class Card {
  renderer: CardRenderer | null = null;

  async initializeRenderer() {
    this.renderer = await CardRenderer.createCard(getApp().scene);
  }

  async play(): Promise<void> {
    await Tools.DelayAsync(500);
  }

  dispose() {
    this.renderer?.dispose();
    this.renderer = null;
  }
}
