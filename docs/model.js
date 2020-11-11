export class TileSet {
  constructor() {
    this.tilesById = new Map();
    this.tilesBySource = new Map();
    this.tilesByGroup = new Map();
    this.exampleTilesByGroup = new Map();
  }

  addTile(tile) {
    tile.tileset = this;
    this.tilesById.set(tile.id, tile);
    addToSet(this.tilesBySource, tile.sourceFilename, tile);
    for (const g of tile.groups) {
      addToSet(this.tilesByGroup, g, tile);
    }
    if (tile.specificGroup && tile.isExample) {
      this.exampleTilesByGroup.set(tile.specificGroup, tile);
    }
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

  examples() {
    const keys = Array.from(this.exampleTilesByGroup.keys());
    keys.sort();
    const result = [];
    for (const key of keys) {
      result.push({
        group: key,
        tile: this.exampleTilesByGroup.get(key),
      });
    }
    return result;
  }

  deleteSource(source) {
    for (const tile of this.tilesBySource.get(source)) {
      this.deleteTile(tile);
    }
    if (this.tilesBySource.get(source)) {
      throw new Error("Leftover tiles");
    }
  }

  deleteTile(tile) {
    this.tilesById.delete(tile.id);
    deleteFromSet(this.tilesBySource, tile.sourceFilename, tile);
    for (const g of tile.groups) {
      deleteFromSet(this.tilesByGroup, g, tile);
    }
    if (tile.specificGroup && tile.isExample) {
      this.exampleTilesByGroup.delete(tile.specificGroup);
    }
  }

  setIsExample(tile, isExample) {
    if (isExample && tile.specificGroup) {
      for (const t of this.tilesById.values()) {
        if (t.specificGroup === tile.specificGroup && t !== tile) {
          t.isExample = false;
        }
      }
      this.exampleTilesByGroup.set(tile.specificGroup, tile);
    }
    tile._isExample = isExample;
  }

  setSpecificGroup(tile, specificGroup) {
    for (const g of tile.groups) {
      deleteFromSet(this.tilesByGroup, g, tile);
    }
    if (tile.isExample && tile.specificGroup) {
      this.exampleTilesByGroup.delete(tile.specificGroup);
    }
    tile._specificGroup = specificGroup;
    for (const g of tile.groups) {
      addToSet(this.tilesByGroup, g, tile);
    }
    if (tile.isExample && tile.specificGroup) {
      const prev = this.exampleTilesByGroup.get(tile.specificGroup);
      if (prev && prev !== tile) {
        this.setIsExample(prev, false);
      }
      this.exampleTilesByGroup.set(tile.specificGroup, tile);
    }
  }

  toJSON() {
    return {
      tiles: Array.from(this.tilesById.values()).map((t) => t.toJSON()),
    };
  }
}

TileSet.fromJSON = (json) => {
  const tileset = new TileSet();
  for (const tileJson of json.tiles) {
    tileset.addTile(new Tile(tileJson));
  }
  return tileset;
};

function listy(value) {
  if (typeof value === "string") {
    return [value];
  }
  if (!value) {
    return [];
  }
  return value;
}

function delist(values) {
  while (values.length && !values[values.length - 1]) {
    values.pop();
  }
  if (!values.length) {
    return undefined;
  }
  if (values.length === 1) {
    return values[0];
  }
  values = values.map((x) => (x ? x : null));
  return values;
}

function addToSet(map, key, value) {
  if (!map.get(key)) {
    map.set(key, new Set());
  }
  map.get(key).add(value);
}

function deleteFromSet(map, key, value) {
  const set = map.get(key);
  set.delete(value);
  if (!set.size) {
    map.delete(key);
  }
}

export class Tile {
  constructor({
    tileset,
    id,
    title,
    imageUrl,
    animateUrls,
    objectType,
    specificGroup,
    isExample,
    sourceFilename,
    sourceX,
    sourceY,
    leftId,
    rightId,
    topId,
    bottomId,
  }) {
    this.tileset = tileset;
    this.id = id || "/" + uuidv4();
    this.title = title;
    this.imageUrl = imageUrl;
    this.animateUrls = animateUrls;
    this.objectType = objectType;
    this._specificGroup = specificGroup;
    this._isExample = isExample || false;
    this.sourceFilename = sourceFilename || "none";
    this.sourceX = sourceX;
    this.sourceY = sourceY;
    this.leftId = listy(leftId);
    this.rightId = listy(rightId);
    this.topId = listy(topId);
    this.bottomId = listy(bottomId);
  }

  get isExample() {
    return this._isExample;
  }

  set isExample(value) {
    this.tileset.setIsExample(this, value);
  }

  get specificGroup() {
    return this._specificGroup;
  }

  set specificGroup(value) {
    this.tileset.setSpecificGroup(this, value);
  }

  get groups() {
    if (!this._specificGroup) {
      return [];
    }
    const result = [];
    let s = this._specificGroup;
    while (s && s.includes(".")) {
      result.push(s);
      s = s.replace(/\.[^.]*$/, "");
    }
    result.push(s);
    return result;
  }

  setDirection(direction, count, tile) {
    const idName = direction + "Id";
    if (!this[idName]) {
      this[idName] = [];
    }
    if (!tile) {
      this[idName][count] = null;
    } else {
      this[idName][count] = tile.id;
      const otherName = oppositeDirections[direction] + "Id";
      const otherCounts = [count, 0, 1, 2, 3];
      if (!tile[otherName]) {
        tile[otherName] = [];
      }
      let found = false;
      for (const i of otherCounts) {
        if (!tile[otherName][i]) {
          tile[otherName][i] = this.id;
          found = true;
          break;
        }
      }
      if (!found) {
        // Too many!
        window.alert("Too many tiles attached to other tile");
      }
    }
  }

  setDirectionGroup(direction, count, group) {
    const idName = direction + "Id";
    if (!this[idName]) {
      this[idName] = [];
    }
    if (!group) {
      this[idName][count] = null;
      return;
    }
    this[idName][count] = group;
  }

  getDirection(direction, count) {
    const idName = direction + "Id";
    if (!this[idName]) {
      return null;
    }
    const id = this[idName][count] || null;
    if (!id) {
      return null;
    }
    const fixed = this.tileset.tilesById.get(id);
    if (fixed) {
      return fixed;
    }
    if (this.tileset.exampleTilesByGroup.get(id)) {
      return new TileGroup(this.tileset, id);
    }
    return null;
  }

  addTileAsAnimation(other) {
    if (!this.animateUrls) {
      this.animateUrls = [];
    }
    this.animateUrls.push(other.imageUrl);
  }

  toJSON() {
    const data = {
      id: this.id,
      title: this.title,
      imageUrl: this.imageUrl,
      animateUrls: this.animateUrls,
      objectType: this.objectType,
      specificGroup: this.specificGroup,
      sourceFilename: this.sourceFilename,
      sourceX: this.sourceX,
      sourceY: this.sourceY,
      leftId: delist(this.leftId),
      rightId: delist(this.rightId),
      topId: delist(this.topId),
      bottomId: delist(this.bottomId),
    };
    if (this.isExample) {
      data.isExample = true;
    }
    return data;
  }
}

class TileGroup {
  constructor(tileset, groupId) {
    this.tileset = tileset;
    this.groupId = groupId;
  }

  get exampleTile() {
    return this.tileset.exampleTilesByGroup.get(this.groupId);
  }

  get imageUrl() {
    return this.exampleTile.imageUrl;
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

const oppositeDirections = {
  left: "right",
  right: "left",
  top: "bottom",
  bottom: "top",
};
