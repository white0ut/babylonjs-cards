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

export function getGameGUI(): GameGUI {
  if (!globalGameGui) throw new Error("Game GUI not found");
  return globalGameGui;
}
