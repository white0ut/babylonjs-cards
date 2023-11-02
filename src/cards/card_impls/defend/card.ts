import { Tools } from "@babylonjs/core";
import { defendCardIllustrationUrl } from "../../../asset_loader";
import { Card } from "../../card";
import { getBattle } from "../../../battle/battle";

export class DefendCard extends Card {
  constructor() {
    super({
      title: "Defend",
      description: "Add 5 block",
      illustrationUrl: defendCardIllustrationUrl,
      manaCost: 1,
    });
  }

  override async play(): Promise<void> {
    await Tools.DelayAsync(500);
    getBattle().getDefaultHero().addBlock(5);
  }
}
