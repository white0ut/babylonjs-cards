import { GameGUI } from "./gui";
import { render } from "preact";
import { signal } from "@preact/signals";

export class PreactGUI extends GameGUI {
  drawButtonEnabled = signal(true);
  drawPileCount = signal(0);
  discardPileCount = signal(0);
  manaCount = signal(0);

  constructor() {
    super();

    render(this.GuiApp(), document.querySelector("#gui")!);
  }

  updateDrawPile(count: number): void {
    this.discardPileCount.value = count;
  }

  updateDiscardPile(count: number): void {
    this.discardPileCount.value = count;
  }

  updateMana(count: number): void {
    this.manaCount.value = count;
  }

  setDrawButtonEnabled(enabled: boolean): void {
    this.drawButtonEnabled.value = enabled;
  }

  GuiApp() {
    return (
      <>
        <ul>
          <li>Draw pile: {this.drawPileCount}</li>
          <li>Discard pile: {this.discardPileCount}</li>
          <li>Mana: {this.manaCount}</li>
        </ul>
        <button
          disabled={!this.drawButtonEnabled}
          onClick={() => this.handleDrawCard()}
        >
          Draw
        </button>
        <br />
        <button onClick={() => this.handleDiscardHand()}>Discard hand</button>
      </>
    );
  }
}
