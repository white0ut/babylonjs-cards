import { CharacterRenderer } from "./character_renderer";

export class Character {
  private health: number;
  private block: number;
  renderer: CharacterRenderer | null = null;

  constructor(health: number, block: number = 0) {
    this.health = health;
    this.block = block;
  }

  async initializeRenderer() {
    this.renderer = await CharacterRenderer.createRenderer();
    this.renderer.gui.update({
      health: this.health,
      block: this.block,
    });
  }

  takeDamage(damage: number) {
    if (damage < this.block) {
      this.block -= damage;
    } else {
      damage -= this.block;
      this.block = 0;
      this.health = Math.max(this.health - damage, 0);
    }
    this.renderer?.gui.update({ health: this.health, block: this.block });
  }

  dispose() {
    this.renderer?.dispose();
    this.renderer = null;
  }
}
