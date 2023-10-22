import {
  AbstractMesh,
  ISceneLoaderAsyncResult,
  Scene,
  SceneLoader,
  Camera,
  Vector3,
  Tools,
  ActionManager,
  ExecuteCodeAction,
} from "@babylonjs/core";
import * as B from "@babylonjs/core";
import { cardUrl } from "./asset_loader";
import { getCardManger } from "./card_manager";

export class CardRenderer {
  /** The root mesh for positioning. */
  readonly rootMesh: AbstractMesh;
  /** The dipslayed mesh. */
  readonly cardMesh: AbstractMesh;
  /** The mesh that we use for interacting. */
  controlMesh: AbstractMesh | null = null;
  readonly scene: Scene;
  index = -1;

  static async createCard(scene: Scene): Promise<CardRenderer> {
    const result = await SceneLoader.ImportMeshAsync("", cardUrl, "", scene);
    return new CardRenderer(result, scene);
  }

  constructor(result: ISceneLoaderAsyncResult, scene: Scene) {
    const meshes = result.meshes;
    this.rootMesh = meshes[0];
    this.cardMesh = meshes[1];
    this.scene = scene;
  }

  private createControlPlaneMesh(width: number): B.Mesh {
    const plane = B.CreatePlane(
      "control-plane",
      {
        width,
        height: 0.06,
      },
      this.scene
    );
    plane.visibility = 0;

    return plane;
  }

  private handleHover() {
    if (!this.controlMesh) return;
    this.controlMesh.actionManager = new ActionManager();
    this.controlMesh.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => {
        this.rootMesh.position.z = 0.19;
      })
    );
    this.controlMesh.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => {
        this.rootMesh.position.z = 0.2;
      })
    );
    this.controlMesh.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnLeftPickTrigger, () => {
        getCardManger().discardCardFromHand(this.index);
      })
    );
  }

  putInFrontOfCamera(camera: Camera, index: number, totalCards: number) {
    // Update the index.
    this.index = index;

    // What's the most we want a card to move to the left or right?
    const xAllowed = Math.min((totalCards / 6) * 0.1, 0.1);
    const x = funClamp(-1 * xAllowed, xAllowed, index, totalCards);
    // How much should we lift the card above the baseline?
    const yBoost =
      totalCards > 1
        ? Math.sin((index / (totalCards - 1)) * Math.PI) * 0.01
        : 0;
    // How much should we tilt the card to the side?
    const rotateZ = funClamp(-5, 5, index, totalCards);

    this.rootMesh.setParent(camera);
    this.rootMesh.position = new Vector3(x, -0.07 + yBoost, 0.2);
    this.rootMesh.rotation = new Vector3(
      Tools.ToRadians(190),
      Tools.ToRadians(2),
      Tools.ToRadians(rotateZ)
    );

    // Control mesh.
    this.controlMesh?.dispose();

    // I found this number works well.
    const magicWidthBonus = 0.016;
    const controlMeshWidth = ((xAllowed + magicWidthBonus) * 2) / totalCards;

    this.controlMesh = this.createControlPlaneMesh(controlMeshWidth);
    this.controlMesh.setParent(camera);
    this.controlMesh.position = new Vector3(x, -0.05, 0.189);
    this.controlMesh.rotation = new Vector3(Tools.ToRadians(10), 0, 0);
    // Register action handler on the new mesh.
    this.handleHover();
  }

  dispose() {
    this.rootMesh.dispose(false, true);
    this.controlMesh?.dispose();
  }
}

/**
 * Given the index and the totoal, returns the
 * proportional spot between min and max.
 */
function funClamp(
  min: number,
  max: number,
  index: number,
  total: number
): number {
  if (total === 1) return (min + max) / 2;
  return (index / (total - 1)) * (max - min) + min;
}
