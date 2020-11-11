/* eslint-disable jsx-a11y/no-access-key */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
// Not compatible with JSX:
/* eslint-disable no-unused-vars */
/* globals React */

export class View extends React.Component {
  render() {
    return (
      <div
        style={{
          height: "100vh",
          width: "100vw",
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gridTemplateRows: "1fr 1fr",
        }}
      >
        <div
          style={{
            gridRowStart: "1",
            gridRowEnd: "span 2",
            overflow: "scroll",
          }}
        >
          <Controls controller={this.props.controller} />
          <div style={{ overflow: "scroll" }}>
            <TileList
              clickTileStatus={this.props.clickTileStatus}
              controller={this.props.controller}
              tileset={this.props.tileset}
            />
          </div>
        </div>

        <div
          style={{
            gridColumnStart: "2",
            gridRowStart: "1",
          }}
        >
          <TileEditor
            tile={this.props.editTile1}
            tileset={this.props.tileset}
            controller={this.props.controller}
            primary={true}
          />
        </div>

        <div
          style={{
            gridColumnStart: "2",
            gridRowStart: "2",
          }}
        >
          <TileEditor
            tile={this.props.editTile2}
            tileset={this.props.tileset}
            controller={this.props.controller}
            primary={false}
          />
        </div>
      </div>
    );
  }
}

class Controls extends React.Component {
  constructor(props) {
    super(props);
    this.state = { saving: false };
  }
  render() {
    return (
      <fieldset>
        <legend>Controls</legend>
        <button type="button" onClick={this.onSave.bind(this)}>
          {this.state.saving ? "Saved!" : "Save"}
        </button>
        <label>
          Import:
          <input
            type="file"
            ref={this.fileRef}
            onInput={this.onInput.bind(this)}
            multiple="1"
          />
        </label>
      </fieldset>
    );
  }

  onSave() {
    this.props.controller.save();
    this.setState({ saving: true });
    setTimeout(() => {
      this.setState({ saving: false });
    }, 2000);
  }

  onInput(event) {
    this.props.controller.addFiles(event.target.files);
  }
}

class TileList extends React.Component {
  render() {
    const result = [];
    const grids = this.props.tileset.tileGrids();
    for (const grid of grids) {
      result.push(
        <TileGrid
          sourceFilename={grid.sourceFilename}
          grid={grid.grid}
          controller={this.props.controller}
          key={grid.sourceFilename}
        />
      );
    }
    return (
      <div>
        {this.props.clickTileStatus ? (
          <div onClick={this.onClickStatus.bind(this)}>
            On click: {this.props.clickTileStatus}
          </div>
        ) : null}
        <SpecialTiles
          controller={this.props.controller}
          tileset={this.props.tileset}
        />
        {result}
      </div>
    );
  }

  onClickStatus() {
    this.props.controller.editTile(null);
  }
}

class SpecialTiles extends React.Component {
  render() {
    const examples = [];
    for (const e of this.props.tileset.examples()) {
      examples.push(
        <li onClick={() => this.props.controller.editGroup(e.group, e.tile)}>
          <img src={e.tile.imageUrl} alt="" />
          Group {e.group}
        </li>
      );
    }
    return (
      <ul className="special-tiles">
        <li onClick={() => this.props.controller.editEmptyTile()}>
          <img src="/images/delete.png" alt="delete" />
          Delete / blank
        </li>
        {examples}
      </ul>
    );
  }
}

class TileGrid extends React.Component {
  render() {
    const tableRows = [];
    for (let y = 0; y < this.props.grid.length; y++) {
      const row = [];
      for (let x = 0; x < this.props.grid[y].length; x++) {
        const tile = this.props.grid[y][x];
        if (!tile) {
          row.push(<td key={x}></td>);
        } else {
          row.push(
            <td key={x}>
              <Tile tile={tile} controller={this.props.controller} />
            </td>
          );
        }
      }
      tableRows.push(<tr key={y}>{row}</tr>);
    }
    return (
      <div>
        <div>
          {this.props.sourceFilename}{" "}
          <button type="button" onClick={this.deleteSource.bind(this)}>
            ×
          </button>
        </div>
        <table className="tiles">{tableRows}</table>
      </div>
    );
  }

  deleteSource() {
    if (!window.confirm("Delete this entire set of tiles?")) {
      return;
    }
    this.props.controller.deleteSource(this.props.sourceFilename);
  }
}

class Tile extends React.Component {
  render() {
    return (
      <TileImage tile={this.props.tile} onClick={this.onClick.bind(this)} />
    );
  }

  onClick() {
    this.props.controller.editTile(this.props.tile);
  }
}

class TileImage extends React.Component {
  render() {
    const anim = this.props.tile.animateUrls;
    const main = this.props.tile.imageUrl;
    if (!anim) {
      return (
        <img
          className={this.props.className}
          src={main}
          alt={`Tile ${this.props.tile.id}`}
          onClick={this.props.onClick}
        />
      );
    }
    const images = [main].concat(anim);
    return (
      <div
        className={`anim-tiles ${this.props.className || ""}`}
        onClick={this.props.onClick}
      >
        {images.map((url, index) => {
          return (
            <img
              style={this.props.style}
              src={url}
              key={index}
              alt={`Tile ${index + 1} ${this.props.tile.id}`}
              className={`image-${index + 1}-of-${images.length}`}
            />
          );
        })}
      </div>
    );
  }
}

class TileEditor extends React.Component {
  render() {
    const tile = this.props.tile;
    const tileset = this.props.tileset;
    if (!tile) {
      return <div>Click to edit a tile</div>;
    }
    function radioClass(objectType) {
      if (
        (objectType === null && !tile.objectType) ||
        tile.objectType === objectType
      ) {
        return "selected";
      }
      return null;
    }
    return (
      <fieldset>
        <legend>Tile editor {tile.id}</legend>
        <div>
          <TileImage tile={tile} className="x2" />
          <button type="button" onClick={this.addAnimation.bind(this)}>
            +anim
          </button>
          <label>
            Title:
            <input
              type="text"
              defaultValue={tile.title}
              onKeyUp={this.editTitle.bind(this)}
            />
          </label>
          <label>
            Group:
            <input
              type="text"
              value={tile.specificGroup || ""}
              onChange={this.editGroup.bind(this)}
            />
          </label>
          <label>
            Example:
            <input
              type="checkbox"
              checked={tile.isExample}
              onChange={this.editExample.bind(this)}
            />
          </label>
          <button
            type="button"
            onClick={this.deleteTile.bind(this)}
            accessKey={this.props.primary ? "d" : null}
          >
            Delete
          </button>
          <div className="radios">
            Type:
            <label className={radioClass(null)}>
              <input
                type="radio"
                name={`objectType-${tile.id}`}
                value="none"
                checked={!tile.objectType}
                onChange={this.onTypeChange.bind(this)}
              />
              None
            </label>
            <label className={radioClass("ground")}>
              <input
                type="radio"
                name={`objectType-${tile.id}`}
                value="ground"
                checked={tile.objectType === "ground"}
                onChange={this.onTypeChange.bind(this)}
              />
              Ground
            </label>
            <label className={radioClass("decor")}>
              <input
                type="radio"
                name={`objectType-${tile.id}`}
                value="decor"
                checked={tile.objectType === "decor"}
                onChange={this.onTypeChange.bind(this)}
              />
              Decor
            </label>
            <label className={radioClass("object")}>
              <input
                type="radio"
                name={`objectType-${tile.id}`}
                value="object"
                checked={tile.objectType === "object"}
                onChange={this.onTypeChange.bind(this)}
              />
              Object
            </label>
          </div>
        </div>
        <hr />
        <div>
          {[0, 1, 2, 3].map((i) => (
            <TileDirections
              tile={tile}
              tileset={tileset}
              controller={this.props.controller}
              count={i}
              key={i}
            />
          ))}
        </div>
      </fieldset>
    );
  }

  editTitle(event) {
    this.props.tile.title = event.target.value;
  }

  editGroup(event) {
    this.props.tile.specificGroup = event.target.value;
    this.props.controller.render();
  }

  editExample(event) {
    this.props.tile.isExample = event.target.checked;
    this.props.controller.render();
  }

  deleteTile() {
    if (!window.confirm("Really delete?")) {
      return;
    }
    this.props.tile.tileset.deleteTile(this.props.tile);
    this.props.controller.render();
  }

  addAnimation() {
    this.props.controller.addAnimation(this.props.tile);
  }

  onTypeChange(event) {
    let value = event.target.value;
    if (value === "none") {
      value = null;
    }
    this.props.tile.objectType = value;
    this.props.controller.render();
  }
}

class TileDirections extends React.Component {
  render() {
    const tile = this.props.tile;
    const count = this.props.count;
    const left = tile.getDirection("left", count);
    const right = tile.getDirection("right", count);
    const top = tile.getDirection("top", count);
    const bottom = tile.getDirection("bottom", count);
    function tileImg(tile) {
      return (
        <img
          src={tile.imageUrl}
          className={tile.groupId ? "group-tile" : null}
          alt=""
        />
      );
    }
    return (
      <div
        style={{
          display: "inline-grid",
          gridTemplateColumns: "32px 32px 32px",
          gridTemplateRows: "32px 32px 32px",
        }}
      >
        <div
          style={{
            gridColumnStart: 2,
            gridRowStart: 1,
          }}
          className="tile-dir"
          onClick={this.editDirection.bind(this, "top")}
        >
          {top ? (
            tileImg(top)
          ) : (
            <img src="images/dir-up.png" alt="add up tile" />
          )}
        </div>
        <div
          style={{ gridColumnStart: 1, gridRowStart: 2 }}
          className="tile-dir"
          onClick={this.editDirection.bind(this, "left")}
        >
          {left ? (
            tileImg(left)
          ) : (
            <img src="images/dir-left.png" alt="add left tile" />
          )}
        </div>
        <div style={{ gridColumnStart: 2, gridGrowStart: 2 }}>
          <img src={tile.imageUrl} alt="Main tile" />
        </div>
        <div
          style={{ gridColumnStart: 3, gridRowStart: 2 }}
          className="tile-dir"
          onClick={this.editDirection.bind(this, "right")}
        >
          {right ? (
            tileImg(right)
          ) : (
            <img src="images/dir-right.png" alt="add right tile" />
          )}
        </div>
        <div
          style={{
            gridColumnStart: 2,
            gridRowStart: 3,
          }}
          className="tile-dir"
          onClick={this.editDirection.bind(this, "bottom")}
        >
          {bottom ? (
            tileImg(bottom)
          ) : (
            <img src="images/dir-down.png" alt="add down tile" />
          )}
        </div>
      </div>
    );
  }

  editDirection(direction) {
    this.props.controller.editDirection(
      this.props.tile,
      direction,
      this.props.count
    );
  }
}
