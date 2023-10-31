import * as GUI from "@babylonjs/gui";
import { getApp } from "../app";
import { getCardManger } from "../cards/card_manager";

let globalGameGui: GameGUI | null = null;

export class GameGUI {
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
    await advancedTexture.parseFromSnippetAsync("KHNI6A#5");

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
    this.manaLabel = container.getChildByName("ManaLabel") as GUI.TextBlock;
    this.drawButton = container.getChildByName("DrawButton") as GUI.Button;
    this.discardHandButton = container.getChildByName(
      "DiscardHandButton"
    ) as GUI.Button;

    this.drawButton.onPointerUpObservable.add(async () => {
      await getCardManger().drawCardsToHand(1);
      getCardManger().renderHand(25);
    });
    this.discardHandButton.onPointerUpObservable.add(async () => {
      this.drawButton.isEnabled = false;
      await getCardManger().discardHand();
      this.drawButton.isEnabled = true;
    });
  }

  updateDrawPile(count: number) {
    this.drawPileLabel.text = `Draw pile: ${count}`;
  }

  updateDiscardPile(count: number) {
    this.discardPileLabel.text = `Discard pile: ${count}`;
  }

  // TODO: mana label is off the screen.
  updateMana(count: number) {
    this.manaLabel.text = `Mana: ${count}`;
  }
}

export function getGameGUI(): GameGUI {
  if (!globalGameGui) throw new Error("Game GUI not found");
  return globalGameGui;
}
