import { CharacterRenderer } from "./character_renderer";

export class Character {
  private health: number;
  private block: number;
  private renderer: CharacterRenderer | null = null;

  constructor(health: number, block: number) {
    this.health = health;
    this.block = block;
  }

  async initializeRenderer() {
    this.renderer = await CharacterRenderer.createRenderer();
  }

  takeDamage(damage: number) {
    if (damage < this.block) {
      this.block -= damage;
    } else {
      damage -= this.block;
      this.block = 0;
      this.health = Math.max(this.health - damage, 0);
    }
  }
}
