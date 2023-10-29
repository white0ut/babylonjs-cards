import { defendCardIllustrationUrl } from "../../../asset_loader";
import { Card } from "../../card";

export class DefendCard extends Card {
  constructor() {
    super({
      title: "Defend",
      description: "Add 5 block",
      illustrationUrl: defendCardIllustrationUrl,
    });
  }
}
