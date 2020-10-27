export class TileSet {
  constructor() {
    this.tilesById = new Map();
    this.tilesBySource = new Map();
  }

  addTile(tile) {
    this.tilesById.set(tile.id, tile);
    if (!this.tilesBySource.get(tile.sourceFilename)) {
      this.tilesBySource.set(tile.sourceFilename, []);
    }
    this.tilesBySource.get(tile.sourceFilename).push(tile);
  }

  tileList() {
    const list = Array.from(this.tilesById.entries());
    list.sort((a, b) => {
      return cmp(a[0].id, b[0].id);
    });
    return list.map((x) => x[1]);
  }

  tileGrids() {
    const grids = [];
    const names = Array.from(this.tilesBySource.keys());
    names.sort();
    for (const name of names) {
      const entry = { sourceFilename: name, grid: [] };
      grids.push(entry);
      for (const tile of this.tilesBySource.get(name)) {
        while (entry.grid.length <= tile.sourceY) {
          entry.grid.push([]);
        }
        const row = entry.grid[tile.sourceY];
        while (row.length <= tile.sourceX) {
          row.push(null);
        }
        row[tile.sourceX] = tile;
      }
    }
    return grids;
  }

  toJSON() {
    return { tiles: this.tileList().map((t) => t.toJSON()) };
  }
}

TileSet.fromJSON = (json) => {
  const tileset = new TileSet();
  for (const tileJson of json.tiles) {
    tileset.addTile(new Tile(tileJson));
  }
  return tileset;
};

export class Tile {
  constructor({ id, title, imageUrl, sourceFilename, sourceX, sourceY }) {
    this.id = id || uuidv4();
    this.title = title;
    this.imageUrl = imageUrl;
    this.sourceFilename = sourceFilename || "none";
    this.sourceX = sourceX;
    this.sourceY = sourceY;
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      imageUrl: this.imageUrl,
      sourceFilename: this.sourceFilename,
      sourceX: this.sourceX,
      sourceY: this.sourceY,
    };
  }
}

function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function cmp(a, b) {
  if (a === b) {
    return 0;
  }
  return a < b ? 1 : -1;
}
