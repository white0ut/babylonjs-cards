import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

export default defineConfig({
  assetsInclude: ["**/*.gltf", "**/*.glb"],
  plugins: [preact()],
});
