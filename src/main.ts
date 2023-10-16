import "./style.css";
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import { App } from "./app";
import { Card } from "./card";

async function createStarterScene(app: App) {
  // Creates and positions a free camera
  const camera = new BABYLON.FreeCamera(
    "camera1",
    new BABYLON.Vector3(0, 5, -10),
    app.scene
  );
  // Let the camera render really close things (cards)
  camera.minZ = 0;
  // Targets the camera to scene origin
  camera.setTarget(BABYLON.Vector3.Zero());

  // Attaches the camera to the canvas
  camera.attachControl(app.canvasElement, true);
  // Creates a light, aiming 0,1,0
  const light = new BABYLON.HemisphericLight(
    "light",
    new BABYLON.Vector3(0, 1, 0),
    app.scene
  );
  // Dim the light a small amount 0 - 1
  light.intensity = 0.7;
  // Built-in 'sphere' shape.
  const sphere = BABYLON.MeshBuilder.CreateSphere(
    "sphere",
    { diameter: 2, segments: 32 },
    app.scene
  );
  // Move sphere upward 1/2 its height
  sphere.position.y = 1;
  // Move the sphere over
  sphere.position.x = -1.5;
  // Built-in 'ground' shape.
  BABYLON.MeshBuilder.CreateGround(
    "ground",
    { width: 6, height: 6 },
    app.scene
  );

  // Card
  const numCards = 8;
  for (let i = 0; i < numCards; i++) {
    const card = await Card.createCard(app.scene);
    card.putInFrontOfCamera(camera, i, numCards);
  }
}

async function main() {
  const app = new App();
  await createStarterScene(app);
  app.start();
}

main();
