import { CardRenderer } from "./card_renderer";
import { getApp } from "../app";

export class Card {
  renderer: CardRenderer | null = null;

  async initializeRenderer() {
    this.renderer = await CardRenderer.createCard(getApp().scene);
  }

  dispose() {
    this.renderer?.dispose();
    this.renderer = null;
  }
}
