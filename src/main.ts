import "./style.css";
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import { App } from "./app";
import { GameGUI } from "./gui/gui";
import { AttackCard } from "./cards/card_implentations/attack/card";
import { DefendCard } from "./cards/card_implentations/defend/card";
import { Card } from "./cards/card";
import { Character } from "./characters/character";
import { Battle } from "./battle/battle";
import { Player } from "./characters/player";

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

  // Creates a light, aiming 0,1,0
  const light = new BABYLON.HemisphericLight(
    "light",
    new BABYLON.Vector3(0, 1, 0),
    app.scene
  );
  // Dim the light a small amount 0 - 1
  light.intensity = 0.7;

  // Built-in 'ground' shape.
  BABYLON.MeshBuilder.CreateGround(
    "ground",
    { width: 6, height: 6 },
    app.scene
  );

  // Create a battle.
  const starterDeck: Card[] = [];
  for (let i = 0; i < 10; i++) {
    starterDeck.push(new AttackCard());
    starterDeck.push(new DefendCard());
  }
  const player = new Player(3, starterDeck);
  const battle = new Battle([player], [new Character(25, 10)]);
  await battle.render();

  await GameGUI.createGameGUI();

  await battle.startNextTurn();
}

async function main() {
  const app = new App();
  await createStarterScene(app);
  app.start();
}

main();
