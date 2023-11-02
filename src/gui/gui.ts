import * as GUI from "@babylonjs/gui";
import { getApp } from "../app";
import { getCardManger } from "../cards/card_manager";

let globalGameGui: GameGUI | null = null;

export abstract class GameGUI {
  constructor() {
    if (globalGameGui) throw new Error("Game GUI already exists");
    globalGameGui = this;
  }

  abstract updateDrawPile(count: number): void;
  abstract updateDiscardPile(count: number): void;
  abstract updateMana(count: number): void;

  abstract setDrawButtonEnabled(enabled: boolean): void;

  async handleDrawCard(): Promise<void> {
    await getCardManger().drawCardsToHand(1);
    getCardManger().renderHand(25);
  }

  async handleDiscardHand(): Promise<void> {
    this.setDrawButtonEnabled(false);
    await getCardManger().discardHand();
    this.setDrawButtonEnabled(true);
  }
}

export class AdvancedTextureGameGUI extends GameGUI {
  private readonly drawPileLabel: GUI.TextBlock;
  private readonly discardPileLabel: GUI.TextBlock;
  private readonly manaLabel: GUI.TextBlock;
  private readonly drawButton: GUI.Button;
  private readonly discardHandButton: GUI.Button;

  static async createGameGUI(): Promise<GameGUI> {
    const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI(
      "GUI",
      true,
      getApp().scene
    );
    await advancedTexture.parseFromSnippetAsync("KHNI6A#6");

    return new AdvancedTextureGameGUI(advancedTexture);
  }

  constructor(advancedTexture: GUI.AdvancedDynamicTexture) {
    super();

    const [container] = advancedTexture.getChildren();
    this.drawPileLabel = container.getChildByName(
      "DrawPileLabel"
    ) as GUI.TextBlock;
    this.discardPileLabel = container.getChildByName(
      "DiscardPileLabel"
    ) as GUI.TextBlock;
    this.manaLabel = container.getChildByName("ManaLabel") as GUI.TextBlock;
    this.drawButton = container.getChildByName("DrawButton") as GUI.Button;
    this.discardHandButton = container.getChildByName(
      "DiscardHandButton"
    ) as GUI.Button;

    this.drawButton.onPointerUpObservable.add(async () => {
      await this.handleDrawCard();
    });
    this.discardHandButton.onPointerUpObservable.add(async () => {
      await this.handleDiscardHand();
    });
  }

  setDrawButtonEnabled(enabled: boolean): void {
    this.drawButton.isEnabled = enabled;
  }

  updateDrawPile(count: number) {
    this.drawPileLabel.text = `Draw pile: ${count}`;
  }

  updateDiscardPile(count: number) {
    this.discardPileLabel.text = `Discard pile: ${count}`;
  }

  updateMana(count: number) {
    this.manaLabel.text = `Mana: ${count}`;
  }
}

export function getGameGUI(): GameGUI {
  if (!globalGameGui) throw new Error("Game GUI not found");
  return globalGameGui;
}
