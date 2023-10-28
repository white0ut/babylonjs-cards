import { Tools, Vector3 } from "@babylonjs/core";

export function toRadians(x: number, y: number, z: number): Vector3 {
  return new Vector3(
    Tools.ToRadians(x),
    Tools.ToRadians(y),
    Tools.ToRadians(z)
  );
}
