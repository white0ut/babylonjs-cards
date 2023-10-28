import {
  AbstractMesh,
  ISceneLoaderAsyncResult,
  Scene,
  SceneLoader,
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
  ELIGIBLE_TO_PLAY,
}

export class CardRenderer {
  /** The root mesh for positioning. */
  readonly rootMesh: AbstractMesh;
  /** The displayed mesh. */
  readonly cardMesh: AbstractMesh;
  /** The border around the card. */
  readonly borderMesh: AbstractMesh;
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
    // Not sure why these indices seem backwards.
    this.cardMesh = meshes[2];
    this.borderMesh = meshes[1];
    this.scene = scene;

    this.borderMesh.isVisible = false;
    const borderMaterial = new B.StandardMaterial("BorderMaterial", scene);
    borderMaterial.diffuseColor = B.Color3.Blue();
    borderMaterial.emissiveColor = B.Color3.Blue();
    // Dispose the default material put in by the loader.
    this.borderMesh.material?.dispose();
    this.borderMesh.material = borderMaterial;

    this.rootMesh.setParent(scene.getCameraByName("camera1"));
    this.rootMesh.position = new Vector3(X_POS.spawn, Y_POS.spawn, Z_POS.spawn);

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
      let targetPosition = this.getBaseTransformation(
        this.index,
        getCardManger().getHandSize()
      ).position;
      const borderMaterial = this.borderMesh.material as B.StandardMaterial;
      switch (state) {
        case CardRenderState.UNDEFINED:
          this.borderMesh.isVisible = false;
          targetPosition.z = Z_POS.base;
          this.positionLerp = new V3Lerp(
            this.rootMesh.position,
            targetPosition,
            10
          );
          break;
        case CardRenderState.HOVER:
          this.borderMesh.isVisible = false;
          targetPosition.z = Z_POS.hover;
          this.positionLerp = new V3Lerp(
            this.rootMesh.position,
            targetPosition,
            10
          );
          break;
        case CardRenderState.PICKED:
          this.borderMesh.isVisible = true;
          borderMaterial.emissiveColor = B.Color3.Blue();
          targetPosition.z = Z_POS.picked;
          this.positionLerp = new V3Lerp(
            this.rootMesh.position,
            targetPosition,
            10
          );
          break;
        case CardRenderState.ELIGIBLE_TO_PLAY:
          this.borderMesh.isVisible = true;
          borderMaterial.emissiveColor = B.Color3.Green();
          targetPosition.y = Y_POS.toPlay;
          this.positionLerp = new V3Lerp(
            this.rootMesh.position,
            targetPosition,
            10
          );
          break;
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
          const canvasElement = getApp().canvasElement;
          const pointerMoveAbortController = new AbortController();
          canvasElement.addEventListener(
            "pointermove",
            (ev: MouseEvent) => {
              if (ev.offsetY < canvasElement.height / 2) {
                this.setState(CardRenderState.ELIGIBLE_TO_PLAY);
              } else {
                this.setState(CardRenderState.PICKED);
              }
            },
            {
              signal: pointerMoveAbortController.signal,
            }
          );
          canvasElement.addEventListener(
            "pointerup",
            (ev: MouseEvent) => {
              pointerMoveAbortController.abort();
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

  /**
   * Returns the base position and rotation for the card in the hand.
   * @param camera The camera to parent the cards to.
   * @param index The index of this card in the hand.
   * @param totalCards The total number of cards in the hand
   * @param update Whether this should update the cards base transformation member variable.
   */
  getBaseTransformation(
    index: number,
    totalCards: number
  ): {
    position: Vector3;
    rotation: Vector3;
    controlMeshPosition: Vector3;
    controlMeshRotation: Vector3;
    controlMeshWidth: number;
  } {
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

    const position = new Vector3(x, Y_POS.base + yBoost, Z_POS.base);
    const rotation = new Vector3(
      Tools.ToRadians(X_ROT.base),
      Tools.ToRadians(Y_ROT.base),
      Tools.ToRadians(rotateZ)
    );

    const magicWidthBonus = 0.016;
    const controlMeshWidth = ((xOffset + magicWidthBonus) * 2) / totalCards;
    const controlMeshPosition = new Vector3(x, -0.05, 0.189);
    const controlMeshRotation = new Vector3(Tools.ToRadians(10), 0, 0);

    return {
      position,
      rotation,
      controlMeshPosition,
      controlMeshRotation,
      controlMeshWidth,
    };
  }

  putInFrontOfCamera(index: number, totalCards: number, duration = 10) {
    // Update the index.
    this.index = index;

    const baseTransform = this.getBaseTransformation(index, totalCards);
    this.positionLerp = new V3Lerp(
      this.rootMesh.position,
      baseTransform.position,
      duration
    );
    this.rootMesh.rotation = baseTransform.rotation;

    // Control mesh.
    this.controlMesh?.dispose();

    this.controlMesh = this.createControlPlaneMesh(
      baseTransform.controlMeshWidth
    );
    this.controlMesh.setParent(this.rootMesh.parent);
    this.controlMesh.position = baseTransform.controlMeshPosition;
    this.controlMesh.rotation = baseTransform.controlMeshRotation;
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
  spawn: 0.2,
};
const Y_POS = {
  base: -0.07,
  toPlay: -0.04,
  maxOffset: 0.01,
  spawn: -0.1,
};
const Z_POS = {
  base: 0.2,
  hover: 0.19,
  picked: 0.18,
  spawn: 0.1,
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
