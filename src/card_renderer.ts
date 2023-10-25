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
import { V3Lerp } from "./utils/v3_lerp";

enum CardRenderState {
  UNDEFINED,
  HOVER,
  PICKED,
}

export class CardRenderer {
  /** The root mesh for positioning. */
  readonly rootMesh: AbstractMesh;
  /** The displayed mesh. */
  readonly cardMesh: AbstractMesh;
  /** The mesh that we use for interacting. */
  controlMesh: AbstractMesh | null = null;
  readonly scene: Scene;
  index = -1;
  state = CardRenderState.UNDEFINED;
  positionLerp: V3Lerp | null = null;

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

    this.setUpRenderObservable();
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

  private setUpRenderObservable() {
    const beforeRender = getApp().scene.onBeforeRenderObservable.add(() => {
      if (this.positionLerp) {
        this.rootMesh.position = this.positionLerp.next();
        if (this.positionLerp.done()) this.positionLerp = null;
      }
    });
    this.rootMesh.onDisposeObservable.addOnce(() => beforeRender?.remove());
  }

  private setState(state: CardRenderState) {
    if (this.state !== state) {
      this.state = state;
      const targetPosition = this.rootMesh.position.clone();
      switch (state) {
        case CardRenderState.UNDEFINED:
          targetPosition.z = Z_POS.base;
          this.positionLerp = new V3Lerp(
            this.rootMesh.position,
            targetPosition,
            10
          );
          break;
        case CardRenderState.HOVER:
          targetPosition.z = Z_POS.hover;
          this.positionLerp = new V3Lerp(
            this.rootMesh.position,
            targetPosition,
            10
          );
          break;
        case CardRenderState.PICKED:
          targetPosition.z = Z_POS.picked;
          this.positionLerp = new V3Lerp(
            this.rootMesh.position,
            targetPosition,
            10
          );
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

  putInFrontOfCamera(
    camera: Camera,
    index: number,
    totalCards: number,
    immediately = false
  ) {
    // Update the index.
    this.index = index;

    // What's the most we want a card to move to the left or right?
    const xOffset = Math.min(
      (totalCards / X_POS.maxOffsetAtThisManyCards) * X_POS.maxOffset,
      X_POS.maxOffset
    );
    const x = funClamp(-1 * xOffset, xOffset, index, totalCards);
    // How much should we lift the card above the baseline?
    const yBoost =
      totalCards > 1
        ? Math.sin((index / (totalCards - 1)) * Math.PI) * Y_POS.maxOffset
        : 0;
    // How much should we tilt the card to the side?
    const rotateZ = funClamp(-1 * Z_ROT.max, Z_ROT.max, index, totalCards);

    this.rootMesh.setParent(camera);
    const targetPosition = new Vector3(x, Y_POS.base + yBoost, Z_POS.base);
    if (immediately) {
      this.rootMesh.position = targetPosition;
    } else {
      this.positionLerp = new V3Lerp(
        this.rootMesh.position,
        targetPosition,
        10
      );
    }
    this.rootMesh.rotation = new Vector3(
      Tools.ToRadians(X_ROT.base),
      Tools.ToRadians(Y_ROT.base),
      Tools.ToRadians(rotateZ)
    );

    // Control mesh.
    this.controlMesh?.dispose();

    // I found this number works well.
    // TODO: Put control mesh magic numbers in variables.
    const magicWidthBonus = 0.016;
    const controlMeshWidth = ((xOffset + magicWidthBonus) * 2) / totalCards;

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
 * Magic numbers
 */
const X_POS = {
  maxOffset: 0.1,
  maxOffsetAtThisManyCards: 6,
};
const Y_POS = {
  base: -0.07,
  maxOffset: 0.01,
};
const Z_POS = {
  base: 0.2,
  hover: 0.19,
  picked: 0.18,
};
const X_ROT = {
  base: 190,
};
const Y_ROT = {
  base: 2,
};
const Z_ROT = {
  max: 5,
};

/**
 * Given the index and the total, returns the
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
