import { AbstractMesh } from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";

export class CharacterGUI {
  private readonly healthLabel: GUI.TextBlock;
  private readonly blockLabel: GUI.TextBlock;

  constructor(mesh: AbstractMesh, health: number, block: number) {
    const labels = this.createGuiForMesh(mesh);
    this.healthLabel = labels.healthLabel;
    this.blockLabel = labels.blockLabel;

    this.update({ health, block });
  }

  createGuiForMesh(mesh: AbstractMesh) {
    const texture = GUI.AdvancedDynamicTexture.CreateForMesh(mesh, 200, 200);
    const healthLabel = new GUI.TextBlock("Health label");
    const blockLabel = new GUI.TextBlock("Block label");

    this.initializeFontFormat(healthLabel);
    this.initializeFontFormat(blockLabel);
    blockLabel.topInPixels = 50;

    texture.addControl(healthLabel).addControl(blockLabel);

    return { healthLabel, blockLabel };
  }

  private initializeFontFormat(text: GUI.TextBlock) {
    text.fontSize = "40px";
    text.color = "#fff";
  }

  update(stats: { health?: number; block?: number }) {
    if (stats.health) {
      this.healthLabel.text = `Health: ${stats.health}`;
    }
    if (stats.block) {
      this.blockLabel.text = `Block: ${stats.block}`;
    }
  }
}
