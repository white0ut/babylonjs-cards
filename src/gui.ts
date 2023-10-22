import * as GUI from "@babylonjs/gui";
import { getApp } from "./app";

let globalGameGui: GameGUI | null = null;

export class GameGUI {
  private readonly drawPileLabel: GUI.TextBlock;
  private readonly discardPileLabel: GUI.TextBlock;

  static async createGameGUI(): Promise<GameGUI> {
    const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI(
      "GUI",
      true,
      getApp().scene
    );
    await advancedTexture.parseFromSnippetAsync("KHNI6A#2");

    return new GameGUI(advancedTexture);
  }

  constructor(advancedTexture: GUI.AdvancedDynamicTexture) {
    if (globalGameGui) throw new Error("Game GUI already exists");
    globalGameGui = this;

    const [container] = advancedTexture.getChildren();
    this.drawPileLabel = container.getChildByName(
      "DrawPileLabel"
    ) as GUI.TextBlock;
    this.discardPileLabel = container.getChildByName(
      "DiscardPileLabel"
    ) as GUI.TextBlock;
  }

  updateDrawPile(count: number) {
    this.drawPileLabel.text = `Draw pile: ${count}`;
  }

  updateDiscardPile(count: number) {
    this.discardPileLabel.text = `Discard pile: ${count}`;
  }
}