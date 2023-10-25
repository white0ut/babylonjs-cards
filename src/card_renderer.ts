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
import { getApp } from "./app";

enum CardRenderState {
  UNDEFINED,
  HOVER,
  PICKED,
}

export class CardRenderer {
  /** The root mesh for positioning. */
  readonly rootMesh: AbstractMesh;
  /** The dipslayed mesh. */
  readonly cardMesh: AbstractMesh;
  /** The mesh that we use for interacting. */
  controlMesh: AbstractMesh | null = null;
  readonly scene: Scene;
  index = -1;
  state = CardRenderState.UNDEFINED;

  static async createCard(scene: Scene): Promise<CardRenderer> {
    const result = await SceneLoader.ImportMeshAsync("", cardUrl, "", scene);
    return new CardRenderer(result, scene);
  }

  constructor(result: ISceneLoaderAsyncResult, scene: Scene) {
    const meshes = result.meshes;
    this.rootMesh = meshes[0];
    this.cardMesh = meshes[1];
    this.scene = scene;

    this.cardMesh.outlineColor = B.Color3.Blue();
    this.cardMesh.outlineWidth = 0.001;
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

    this.rootMesh.onDisposeObservable.addOnce(() => plane.dispose());
    return plane;
  }

  private setUpActions() {
    const beforeRender = getApp().scene.onBeforeRenderObservable.add(() => {});
    this.rootMesh.onDisposeObservable.addOnce(() => beforeRender?.remove());
  }

  private setState(state: CardRenderState) {
    if (this.state !== state) {
      this.state = state;
      switch (state) {
        case CardRenderState.UNDEFINED:
          this.rootMesh.position.z = 0.2;
          break;
        case CardRenderState.HOVER:
          this.rootMesh.position.z = 0.19;
          break;
        case CardRenderState.PICKED:
          this.rootMesh.position.z = 0.18;
      }
    }
  }

  private handleHover() {
    if (!this.controlMesh) return;
    this.controlMesh.actionManager = new ActionManager();
    this.controlMesh.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => {
        if (this.state === CardRenderState.UNDEFINED) {
          this.setState(CardRenderState.HOVER);
        }
      })
    );
    this.controlMesh.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => {
        if (this.state === CardRenderState.HOVER) {
          this.setState(CardRenderState.UNDEFINED);
        }
      })
    );
    this.controlMesh.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPickDownTrigger, () => {
        if (this.state === CardRenderState.HOVER) {
          this.setState(CardRenderState.PICKED);
          this.cardMesh.renderOutline = true;
          const canvasElement = getApp().canvasElement;
          canvasElement.addEventListener("pointermove", (ev: MouseEvent) => {
            if (ev.offsetY < canvasElement.height / 2) {
              this.cardMesh.outlineColor = B.Color3.Green();
            } else {
              this.cardMesh.outlineColor = B.Color3.Blue();
            }
          });
          canvasElement.addEventListener(
            "pointerup",
            (ev: MouseEvent) => {
              this.cardMesh.renderOutline = false;
              this.setState(CardRenderState.UNDEFINED);
              if (ev.offsetY < canvasElement.height / 2) {
                getCardManger().discardCardFromHand(this.index);
              }
            },
            { once: true }
          );
        }
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
