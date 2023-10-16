import "./style.css";
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import houseUrl from "./assets/house.glb";
import { App } from "./app";

async function createStarterScene(app: App) {
  // Creates and positions a free camera
  const camera = new BABYLON.FreeCamera(
    "camera1",
    new BABYLON.Vector3(0, 5, -10),
    app.scene
  );
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

  // Load a mesh
  const result = await BABYLON.SceneLoader.ImportMeshAsync(
    "House", // The name of the node from the Blender scene.
    houseUrl,
    undefined,
    app.scene
  );
  // When you import glb or gltf, the first mesh is always "root".
  const houseMesh = result.meshes[0];
  houseMesh.position = new BABYLON.Vector3(1.5, 0, 0);
  // Rotate 90 degree along the Y axis to turn the house towards the camera.
  // This good to know and also I messed up the rotation in Blender.
  houseMesh.rotate(new BABYLON.Vector3(0, 1, 0), BABYLON.Tools.ToRadians(90));
}

async function main() {
  const app = new App();
  await createStarterScene(app);
  app.start();
}

main();
