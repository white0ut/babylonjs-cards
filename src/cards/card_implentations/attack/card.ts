import { attackCardIllustrationUrl } from "../../../asset_loader";
import { Card } from "../../card";

export class AttackCard extends Card {
  constructor() {
    super({
      title: "Attack",
      description: "Deal 6 damage",
      illustrationUrl: attackCardIllustrationUrl,
    });
  }
}
