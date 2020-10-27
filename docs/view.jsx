// Not compatible with JSX:
/* eslint-disable no-unused-vars */
/* globals React */

export class View extends React.Component {
  render() {
    return (
      <div>
        <Controls controller={this.props.controller} />
        <TileList
          controller={this.props.controller}
          tileset={this.props.tileset}
        />
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
        <label htmlFor="upload">
          Import:
          <input
            id="upload"
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
    return <div>{result}</div>;
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
        <div>{this.props.sourceFilename}</div>
        <table className="tiles">{tableRows}</table>
      </div>
    );
  }
}

class Tile extends React.Component {
  render() {
    return (
      <img src={this.props.tile.imageUrl} alt={`Tile ${this.props.tile.id}`} />
    );
  }
}
