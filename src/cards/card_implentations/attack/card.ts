import { Tools } from "@babylonjs/core";
import { attackCardIllustrationUrl } from "../../../asset_loader";
import { getBattle } from "../../../battle/battle";
import { Card } from "../../card";

export class AttackCard extends Card {
  constructor() {
    super({
      title: "Attack",
      description: "Deal 6 damage",
      illustrationUrl: attackCardIllustrationUrl,
    });
  }

  override async play(): Promise<void> {
    await Tools.DelayAsync(500);
    getBattle().getDefaultOpponent().takeDamage(6);
  }
}
