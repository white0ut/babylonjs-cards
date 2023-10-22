import { Camera } from "@babylonjs/core";
import { Card } from "./card";

/**
 * A class for managing card positioning, hands,
 * decks, and discard piles.
 */
export class CardManager {
  private drawPile: Card[] = [];
  private hand: Card[] = [];
  // private discardPile: Card[] = [];

  constructor(private camera: Camera) {}

  createDrawPile(count: number) {
    for (let i = 0; i < count; i++) {
      this.drawPile.push(new Card());
    }
  }

  drawCard(): Card | undefined {
    // TODO: Shuffle
    if (this.drawPile.length) {
      return this.drawPile.pop();
    }
  }

  async drawCardTohand(): Promise<Card | undefined> {
    const card = this.drawCard();
    if (card) {
      this.hand.push(card);
      await card.initializeRenderer();
      return card;
    }
  }

  async drawCardsToHand(count: number) {
    let draws: Promise<Card | undefined>[] = [];
    for (let i = 0; i < count; i++) {
      draws.push(this.drawCardTohand());
    }
    return Promise.all(draws);
  }

  renderHand() {
    for (let cardIndex = 0; cardIndex < this.hand.length; cardIndex++) {
      this.hand[cardIndex].renderer!.putInFrontOfCamera(
        this.camera,
        cardIndex,
        this.hand.length
      );
    }
  }
}
