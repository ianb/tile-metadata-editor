import { TileSet } from "./model.js";
import { Controller } from "./controller.js";

const data = localStorage.getItem("data");
let tileset, editTile1, editTile2;
if (data) {
  tileset = TileSet.fromJSON(JSON.parse(data));
  const editTile1Id = localStorage.getItem("editTile1");
  const editTile2Id = localStorage.getItem("editTile2");
  if (editTile1Id) {
    editTile1 = tileset.tilesById.get(editTile1Id);
  }
  if (editTile2Id) {
    editTile2 = tileset.tilesById.get(editTile2Id);
  }
} else {
  tileset = new TileSet();
}

const controller = new Controller(
  tileset,
  document.getElementById("container"),
  { editTile1, editTile2 }
);

controller.run();
