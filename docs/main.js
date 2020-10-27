import { TileSet } from "./model.js";
import { Controller } from "./controller.js";

const data = localStorage.getItem("data");
let tileset;
if (data) {
  tileset = TileSet.fromJSON(JSON.parse(data));
} else {
  tileset = new TileSet();
}

const controller = new Controller(
  tileset,
  document.getElementById("container")
);

controller.run();
