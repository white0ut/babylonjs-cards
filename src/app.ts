import { Engine, Scene, ActionManager } from "@babylonjs/core";
import { Inspector } from "@babylonjs/inspector";

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

    document.body.addEventListener("keyup", (ev: KeyboardEvent) => {
      if (ev.key === "`") {
        if (!Inspector.IsVisible) {
          Inspector.Show(this.scene, { embedMode: true });
        } else {
          Inspector.Hide();
        }
      }
    });
  }

  start() {
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
    window.addEventListener("resize", () => {
      this.engine.resize();
    });
  }
}

export function getApp(): App {
  if (!globalApp) throw new Error("globalApp not defined");
  return globalApp;
}
