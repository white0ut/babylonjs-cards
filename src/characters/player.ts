import { Card } from "../cards/card";
import { CardManager } from "../cards/card_manager";
import { getGameGUI } from "../gui/gui";
import { Character } from "./character";

export class Player extends Character {
  maxMana: number;
  mana: number;
  cardManager: CardManager;

  constructor(maxMana: number, deck: Card[]) {
    super(50, 0);
    this.maxMana = maxMana;
    this.mana = maxMana;
    this.cardManager = new CardManager(this);
    this.cardManager.createDrawPile(deck);
  }

  initializeRenderer(): Promise<void> {
    getGameGUI().updateMana(this.mana);
    return super.initializeRenderer();
  }

  spendMana(manaCost: number) {
    this.mana -= manaCost;
    getGameGUI().updateMana(this.mana);
  }

  async takeTurn(): Promise<void> {
    return new Promise(async (res) => {
      await this.cardManager.drawCardsToHand(5);
      this.cardManager.renderHand();
      res();
    });
  }
}
