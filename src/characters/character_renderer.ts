import * as B from "@babylonjs/core";
import { getApp } from "../app";

export class CharacterRenderer {
  rootMesh: B.AbstractMesh;
  controlMesh: B.AbstractMesh;
  guiMesh: B.AbstractMesh;

  static createRenderer(): Promise<CharacterRenderer> {
    return Promise.resolve(new CharacterRenderer());
  }

  constructor() {
    const mesh = B.CreateSphere(
      "Character",
      {
        segments: 16,
        diameter: 2,
      },
      getApp().scene
    );

    this.rootMesh = mesh;
    this.controlMesh = mesh;
    this.guiMesh = this.createGuiMesh();

    this.setInitialTransform();
  }

  setInitialTransform(): void {
    this.rootMesh.position = new B.Vector3(0, Y_POS.spawn, 0);
  }

  createGuiMesh(): B.AbstractMesh {
    const plane = B.CreatePlane(
      "Gui",
      {
        size: 1,
      },
      getApp().scene
    );

    plane.setParent(this.rootMesh);
    plane.position = new B.Vector3(0, 1.6, 0);
    plane.billboardMode = B.Mesh.BILLBOARDMODE_ALL;

    return plane;
  }

  dispose() {
    this.rootMesh.dispose(false, true);
  }
}

const Y_POS = {
  spawn: 1,
};