import {
  AbstractMesh,
  ISceneLoaderAsyncResult,
  Scene,
  SceneLoader,
  Camera,
  Vector3,
  Tools,
  ActionManager,
  InterpolateValueAction,
  ExecuteCodeAction,
} from "@babylonjs/core";
import cardUrl from "./assets/card.glb";

export class Card {
  readonly rootMesh: AbstractMesh;
  readonly cardMesh: AbstractMesh;
  readonly scene: Scene;

  static async createCard(scene: Scene): Promise<Card> {
    const result = await SceneLoader.ImportMeshAsync("", cardUrl, "", scene);
    return new Card(result, scene);
  }

  constructor(result: ISceneLoaderAsyncResult, scene: Scene) {
    const meshes = result.meshes;
    this.rootMesh = meshes[0];
    this.cardMesh = meshes[1];
    this.scene = scene;

    this.handleHover();
  }

  private handleHover() {
    this.cardMesh.actionManager = new ActionManager();
    this.cardMesh.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => {
        this.rootMesh.position.z = 0.19;
      })
    );
    this.cardMesh.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => {
        this.rootMesh.position.z = 0.2;
      })
    );
  }

  putInFrontOfCamera(camera: Camera, index: number, totalCards: number) {
    const funClamp = (
      min: number,
      max: number,
      index: number,
      total: number
    ): number => {
      if (total === 1) return (min + max) / 2;
      return (index / (total - 1)) * (max - min) + min;
    };
    // What's the most we want a card to move to the left or right?
    const xAllowed = Math.min((totalCards / 6) * 0.1, 0.1);
    const x = funClamp(-1 * xAllowed, xAllowed, index, totalCards);
    // How much should we lift the card above the baseline?
    const yBoost = totalCards
      ? Math.sin((index / (totalCards - 1)) * Math.PI) * 0.01
      : 0;
    console.log({ index, yBoost });
    // How much should we tilt the card to the side?
    const rotateZ = funClamp(-5, 5, index, totalCards);

    this.rootMesh.setParent(camera);
    this.rootMesh.position = new Vector3(x, -0.05 + yBoost, 0.2);
    this.rootMesh.rotation = new Vector3(
      Tools.ToRadians(190),
      Tools.ToRadians(2),
      Tools.ToRadians(rotateZ)
    );
  }
}
