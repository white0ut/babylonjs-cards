import { Card } from "./card";
import { getGameGUI } from "../gui/gui";
import { Tools } from "@babylonjs/core";
import { AttackCard } from "./card_implentations/attack/card";

let globalCardManager: CardManager | null = null;

/**
 * A class for managing card positioning, hands,
 * decks, and discard piles.
 */
export class CardManager {
  private drawPile: Card[] = [];
  private hand: Card[] = [];
  private discardPile: Card[] = [];

  constructor() {
    if (globalCardManager) throw new Error("Card manager already exists");
    globalCardManager = this;
  }

  createDrawPile(count: number) {
    for (let i = 0; i < count; i++) {
      this.drawPile.push(new AttackCard());
    }
  }

  drawCard(): Card | undefined {
    if (!this.drawPile.length && this.discardPile.length) {
      this.drawPile = this.discardPile;
      this.discardPile = [];
      this.shuffle(this.drawPile);
    }
    return this.drawPile.pop();
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

  async playCardFromhand(index: number) {
    const playedCard = this.hand.splice(index, 1)[0];
    this.renderHand();
    await playedCard.play();
    playedCard.dispose();
    this.discardPile.push(playedCard);
    this.updateGui();
  }

  discardCardFromHand(index: number) {
    const discardedCard = this.hand.splice(index, 1)[0];
    discardedCard.dispose();
    this.discardPile.push(discardedCard);
    this.renderHand();
  }

  async discardHand() {
    while (this.getHandSize()) {
      this.discardCardFromHand(0);
      await Tools.DelayAsync(50);
    }
  }

  renderHand(duration?: number) {
    for (let cardIndex = 0; cardIndex < this.hand.length; cardIndex++) {
      this.hand[cardIndex].renderer!.putInFrontOfCamera(
        cardIndex,
        this.hand.length,
        duration
      );
    }
    this.updateGui();
  }

  updateGui() {
    const gui = getGameGUI();
    gui.updateDrawPile(this.drawPile.length);
    gui.updateDiscardPile(this.discardPile.length);
  }

  dispose() {
    for (let card of this.hand) {
      card.dispose();
    }
    globalCardManager = null;
  }

  /**
   * Shuffles and array of cards in place.
   * https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
   */
  private shuffle(cards: Card[]) {
    let currentIndex = cards.length;
    let randomIndex: number;
    while (currentIndex > 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      // Swaps current index with random index.
      [cards[currentIndex], cards[randomIndex]] = [
        cards[randomIndex],
        cards[currentIndex],
      ];
    }
  }

  getHandSize(): number {
    return this.hand.length;
  }

  getDrawPileSize(): number {
    return this.drawPile.length;
  }

  getDiscardPileSize(): number {
    return this.discardPile.length;
  }
}

export function getCardManger() {
  if (!globalCardManager) {
    throw new Error("Card manager not found.");
  }
  return globalCardManager;
}
