import { Engine, Scene, ActionManager } from "@babylonjs/core";

let globalApp: App | null = null;

export class App {
  readonly canvasElement: HTMLCanvasElement;
  readonly engine: Engine;
  readonly scene: Scene;

  constructor(canvasElementSelector: string = "#app") {
    this.canvasElement = document.querySelector(
      canvasElementSelector
    ) as HTMLCanvasElement;
    this.engine = new Engine(this.canvasElement);
    this.scene = new Scene(this.engine);
    this.scene.actionManager = new ActionManager();
    globalApp = this;
  }

  start() {
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }
}

export function getApp(): App {
  if (!globalApp) throw new Error("globalApp not defined");
  return globalApp;
}
