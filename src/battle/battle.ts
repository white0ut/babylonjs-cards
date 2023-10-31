import { Character } from "../characters/character";

let globalBattle: Battle | null = null;

export class Battle {
  /** Generally, the player. Left side. */
  heroes: Character[];
  /** Right side.  */
  opponents: Character[];

  constructor(heroes: Character[], opponents: Character[]) {
    if (globalBattle) throw new Error("Battle already exists");
    globalBattle = this;
    this.heroes = heroes;
    this.opponents = opponents;
  }

  async render() {
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
