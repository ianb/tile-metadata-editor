/* globals React, ReactDOM */

const SIZE = 32;

import { View } from "./build/view.js";
import { Tile } from "./model.js";

export class Controller {
  constructor(tileset, container) {
    this.tileset = tileset;
    this.containerElement = container;
  }

  run() {
    this.render();
  }

  render() {
    ReactDOM.render(
      React.createElement(View, { tileset: this.tileset, controller: this }),
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

  addCanvas(canvas, filename) {
    const writer = document.createElement("canvas");
    writer.width = SIZE;
    writer.height = SIZE;
    const writerCtx = writer.getContext("2d");
    for (let x = 0; x < canvas.width; x += SIZE) {
      writerCtx.clearRect(0, 0, writer.width, writer.height);
      for (let y = 0; y < canvas.height; y += SIZE) {
        writerCtx.drawImage(canvas, x, y, SIZE, SIZE, 0, 0, SIZE, SIZE);
        const tileUrl = writer.toDataURL("image/png");
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
}
