import { Character } from "../characters/character";
import { GameGUI } from "../gui/gui";

let globalBattle: Battle | null = null;

export class Battle {
  /** Generally, the player. Left side. */
  heroes: Character[];
  /** Right side.  */
  opponents: Character[];
  currentTurn = 0;

  constructor(heroes: Character[], opponents: Character[]) {
    if (globalBattle) throw new Error("Battle already exists");
    globalBattle = this;
    this.heroes = heroes;
    this.opponents = opponents;
  }

  async render() {
    await GameGUI.createGameGUI();
    const heroRender = this.heroes.map((c) =>
      c.initializeRenderer().then(() => {
        c.renderer!.rootMesh.position.x = -1.5;
      })
    );
    const opponentRender = this.opponents.map((c) =>
      c.initializeRenderer().then(() => {
        c.renderer!.rootMesh.position.x = 1.5;
      })
    );
    await Promise.all([...heroRender, ...opponentRender]);
  }

  async startNextTurn() {
    if (this.currentTurn < this.heroes.length) {
      await this.heroes[this.currentTurn].takeTurn();
    } else {
      await this.opponents[this.currentTurn - this.heroes.length].takeTurn();
    }
    this.currentTurn =
      (this.currentTurn + 1) % (this.heroes.length + this.opponents.length);
  }

  getDefaultOpponent(): Character {
    return this.opponents[0];
  }

  getDefaultHero(): Character {
    return this.heroes[0];
  }
}

export function getBattle(): Battle {
  if (!globalBattle) {
    throw new Error("No battle exists");
  }
  return globalBattle;
}
