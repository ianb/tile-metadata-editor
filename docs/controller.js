/* globals React, ReactDOM, Mousetrap */

const SIZE = 32;

import { View } from "./build/view.js";
import { Tile } from "./model.js";

export class Controller {
  constructor(tileset, container, options) {
    this.tileset = tileset;
    this.containerElement = container;
    this.editTile1 = options.editTile1 || null;
    this.editTile2 = options.editTile2 || null;
    this.clickTileStatus = null;
  }

  run() {
    Mousetrap.bind("d", this.keyDelete.bind(this));
    this.render();
  }

  render() {
    ReactDOM.render(
      React.createElement(View, {
        tileset: this.tileset,
        controller: this,
        editTile1: this.editTile1,
        editTile2: this.editTile2,
        clickTileStatus: this.clickTileStatus,
      }),
      this.containerElement
    );
  }

  async addFiles(fileList) {
    for (let i = 0; i < fileList.length; i++) {
      await this.addFile(fileList[i]);
    }
    this.render();
  }

  addFile(fileObj) {
    const filename = fileObj.name;
    return new Promise((resolve, reject) => {
      const imageUrl = URL.createObjectURL(fileObj);
      const img = document.createElement("img");
      img.onload = () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(imageUrl);
        this.addCanvas(canvas, filename);
        resolve();
      };
      img.src = imageUrl;
    });
  }

  addDataUrl(url) {
    window.alert("Not yet implemented");
  }

  addCanvas(canvas, filename) {
    const writer = document.createElement("canvas");
    const seen = new Set();
    writer.width = SIZE;
    writer.height = SIZE;
    const writerCtx = writer.getContext("2d");
    for (let x = 0; x < canvas.width; x += SIZE) {
      writerCtx.clearRect(0, 0, writer.width, writer.height);
      for (let y = 0; y < canvas.height; y += SIZE) {
        writerCtx.drawImage(canvas, x, y, SIZE, SIZE, 0, 0, SIZE, SIZE);
        const tileUrl = writer.toDataURL("image/png");
        if (seen.has(tileUrl)) {
          continue;
        }
        seen.add(tileUrl);
        this.addTileImage(tileUrl, filename, x, y);
      }
    }
  }

  addTileImage(imageUrl, sourceFilename, x, y) {
    const tile = new Tile({
      imageUrl,
      sourceFilename,
      sourceX: x / SIZE,
      sourceY: y / SIZE,
    });
    this.tileset.addTile(tile);
  }

  save() {
    localStorage.setItem("data", JSON.stringify(this.tileset.toJSON()));
  }

  editTile(tile) {
    if (this.onEditTile) {
      this.onEditTile(tile);
      return;
    }
    this.editTile2 = this.editTile1;
    this.editTile1 = tile;
    localStorage.setItem("editTile1", this.editTile1 && this.editTile1.id);
    localStorage.setItem("editTile2", this.editTile2 && this.editTile2.id);
    this.render();
  }

  keyDelete() {
    if (!window.confirm("Delete top tile?")) {
      return;
    }
    this.tileset.deleteTile(this.editTile1);
    this.render();
  }

  deleteSource(sourceFilename) {
    this.tileset.deleteSource(sourceFilename);
    this.render();
  }

  editEmptyTile() {
    if (this.onEditTile) {
      this.onEditTile(null);
    }
  }

  editGroup(group, exampleTile) {
    if (this.onClickGroup) {
      this.onClickGroup(group, exampleTile);
    } else {
      this.editTile(exampleTile);
    }
  }

  editDirection(tile, direction, count) {
    this.clickTileStatus = `Select the tile to direction ${direction}`;
    this.onEditTile = (otherTile) => {
      tile.setDirection(direction, count, otherTile);
      this.onEditTile = null;
      this.onClickGroup = null;
      this.render();
    };
    this.onClickGroup = (group, exampleTile) => {
      tile.setDirectionGroup(direction, count, group);
      this.onEditTile = null;
      this.onClickGroup = null;
      this.render();
    };
    this.render();
  }

  addAnimation(tile) {
    this.clickTileStatus = "Select a tile to animate";
    this.onEditTile = (otherTile) => {
      tile.addTileAsAnimation(otherTile);
      this.tileset.deleteTile(otherTile);
      this.onEditTile = null;
      this.render();
    };
    this.render();
  }
}
