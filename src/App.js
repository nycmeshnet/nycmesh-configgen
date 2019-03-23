import Mustache from "mustache";
import React, { PureComponent } from "react";

let repobase = "https://api.github.com/repos/nycmeshnet/nycmesh-configs/";

class App extends PureComponent {
  state = {
    config: {},
    load: {
      tags: [],
      device: [],
      version: [],
      file: [],
      fileobj: [],
      contents: []
    }
  };

  filecontent() {
    let url = this.state.load["fileobj"]
      .filter(
        f =>
          f.device === this.state.config["device"] &&
          f.file === this.state.config["file"]
      )
      .map(f => f.url)[0];
    let filtered = this.state.load["contents"].filter(c => c.url === url);
    if (filtered[0] !== undefined && filtered[0].content !== undefined) {
      return atob(filtered[0].content);
    } else {
      return "";
    }
  }

  filerender(i) {
    return Mustache.render(this.filecontent(), i);
  }

  filetags() {
    return Mustache.parse(this.filecontent()).reduce(
      (acc, i) =>
        !acc.includes(i[1]) && i[0] === "name" ? acc.concat(i[1]) : acc,
      []
    );
  }

  componentDidMount() {
    this.setState({
      load: {
        ...this.state.load
      }
    });
    this._loadversions();
  }

  _loadversions = event => {
    let v = event !== undefined ? event.target.value : null;
    fetch(repobase + "tags", { method: "get" })
      .then(r => r.json())
      .then(j => j.map(i => i.name))
      .then(tags =>
        this.setState({
          config: {
            version: v || tags[0]
          },
          load: {
            ...this.state.load,
            version: tags
          }
        })
      )
      .then(() => this._loaddevices());
  };

  _loaddevices = event => {
    let v = event !== undefined ? event.target.value : null;
    fetch(repobase + "git/trees/" + this.state.config.version)
      .then(r => r.json())
      .then(j => j.tree.filter(i => i.type === "tree"))
      .then(j =>
        j.map(i =>
          fetch(i.url)
            .then(r => r.json())
            .then(j => j.tree.filter(c => c.path.match(new RegExp(".tmpl$"))))
            .then(j =>
              j.map(x => ({ device: i.path, url: x.url, file: x.path }))
            )
        )
      )
      .then(i =>
        Promise.all(i)
          .then(j => j.reduce((a, c) => a.concat(c), []))
          .then(fileobj =>
            this.setState({
              load: {
                ...this.state.load,
                device: fileobj
                  .map(d => d.device)
                  .filter((v, i, a) => a.indexOf(v) === i),
                fileobj: fileobj
              }
            })
          )
      )
      .then(() =>
        this.setState({
          config: {
            ...this.state.config,
            device: v || this.state.load["fileobj"].map(f => f.device)[0]
          }
        })
      )
      .then(() =>
        this.setState({
          config: {
            ...this.state.config,
            file: this.state.load["fileobj"]
              .filter(f => f.device === this.state.config["device"])
              .map(f => f.file)[0]
          }
        })
      )
      .then(() => this._getfile());
  };

  _getfile = () => {
    Promise.all(
      this.state.load["fileobj"].map(f => fetch(f.url).then(r => r.json()))
    ).then(c =>
      this.setState({
        load: {
          ...this.state.load,
          contents: c
        }
      })
    );
  };

  _tmplrealname = () =>
    this.state.config.file === undefined
      ? "config.txt"
      : this.state.config.file.replace(".tmpl", "");

  _save = event => {
    event.preventDefault();
    var text = this.filerender(this.state.config);
    var blob = new Blob([text], {
      type: "text/csv;charset=utf8;"
    });

    var element = document.createElement("a");
    document.body.appendChild(element);
    element.setAttribute("href", window.URL.createObjectURL(blob));
    element.setAttribute("download", this._tmplrealname());
    element.style.display = "";

    element.click();

    document.body.removeChild(element);
    event.stopPropagation();
  };

  render() {
    return (
      <div className="absolute-l top-0 left-0 bottom-0 right-0 flex flex-column flex-row-l justify-between f5">
        <div className="bg-near-white w-third-l w-100 pa4 unselectable">
          {this.renderForm()}
        </div>
        <div className="w-two-thirds-l w-100 overflow-scroll pa4 bg-bluec">
          {this.renderScript()}
        </div>
      </div>
    );
  }

  renderForm() {
    let tags = this.filetags();
    let files = this.state.load["fileobj"]
      .filter(f => f.device === this.state.config["device"])
      .map(f => f.file);
    return (
      <form className="flex flex-column">
        {this.renderInput(
          "Configs Version",
          "version",
          this.state.load["version"],
          this._loadversions
        )}
        {this.renderInput(
          "Device",
          "device",
          this.state.load["device"],
          this._loaddevices
        )}
        {this.renderInput("File", "file", files)}
        {tags.map(t => this.renderInput(t, t))}
        <button onClick={this._save}>Download Config</button>
      </form>
    );
  }

  renderInput(label, id, options, ocf) {
    let selectoptions = [];
    if (options) {
      selectoptions = options.map(c => (
        <option key={c} value={c}>
          {c}
        </option>
      ));
    }
    let onchangefunc = event => {
      this.setState({
        config: {
          ...this.state.config,
          [id]: event.target.value
        }
      });
      if (ocf !== undefined) {
        ocf(event);
      }
    };
    let p = {
      id: id,
      required: "required",
      value: this.state.config[id],
      spellCheck: false,
      key: id
    };
    return (
      <div key={id} className="flex items-center justify-between mv2">
        <label htmlFor={id}>{label}</label>
        {options ? (
          <select props={p} onChange={onchangefunc}>
            {selectoptions}
          </select>
        ) : (
          <input props={p} onChange={onchangefunc} />
        )}
      </div>
    );
  }

  // scriptText
  renderScript() {
    return (
      <pre className="mv0">
        <code>{this.filerender(this.state.config)}</code>
      </pre>
    );
  }
}

export default App;
