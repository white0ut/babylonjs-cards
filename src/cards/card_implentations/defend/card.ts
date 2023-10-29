import { Card } from "../../card";
import { CardTextureGeneratorOptions } from "../../card_texture_generator";

export class DefendCard extends Card {
  constructor() {
    super({
      title: "Defend",
      description: "Add 5 block",
    });
  }

  override getTextureGeneratorOptions(): CardTextureGeneratorOptions {
    return {
      ...super.getTextureGeneratorOptions(),
      tempGradient: {
        c1: "#00f",
        c2: "#7af",
      },
    };
  }
}
