import Mustache from "mustache";
import React, { PureComponent } from "react";
import { fetch } from 'whatwg-fetch';

let repobase = "https://api.github.com/repos/nycmeshnet/nycmesh-configs/"

class App extends PureComponent {
  state = {
    config: {},
    load: {
      tags: [],
      device: [],
      version: ["versions"],
      file: [],
      config: '',
      fileobj: {}
    }
  };

  filerender(i) {
    return Mustache.render(this.state.load['config'],i);
  }

  filetags() {
    return Mustache.parse(this.state.load['config']).reduce((acc, i) => !acc.includes(i[1]) && i[0] === "name" ? acc.concat(i[1]) : acc, []);
  }

  componentDidMount() {
    this.setState({
      load: {
        ...this.state.load,
      },
    })
    this._loadversions();
  }

  _loadversions() {
    fetch(repobase + 'tags', { method: 'get' })
    .then((r) => r.json())
    .then((j) => j.map((i) => i.name))
    .then((tags) => this.setState({
      config: {
        ...this.state.config,
        "version": tags[0]
      },
      load: {
        ...this.state.load,
        "version": tags
      }
    }))
    .then(() => this._loaddevices());
  }

  _loaddevices() {
    fetch(repobase + 'git/trees/' + this.state.config.version)
    .then((r) => r.json())
    .then((j) => j.tree.filter((i) => i.type === "tree"))
    .then((j) => j.map((i) =>  
	    fetch(i.url)
	    .then((r) => r.json())
	    .then((j) => j.tree.filter((c) => c.path.match(new RegExp(".tmpl$"))))
	    .then((j) => ({ "device": i.path, "url": j[0].url, "file": j[0].path }) )
    ))
    .then((i) => Promise.all(i)
        .then((fileobj) => this.setState({
	      config: {
	        ...this.state.config,
	        "device": fileobj.map((f) => f.device)[0],
	      },
	      load: {
	        ...this.state.load,
		"device": fileobj.map((d) => d.device),
                "fileobj": fileobj,
	      }
	    }))
    )
    .then(() => this.setState({
      config: {
	...this.state.config,
	"file": this.state.load['fileobj'].filter((f) => f.device === this.state.config['device']).map((f) => f.file)[0],
      },
      load: {
	...this.state.load,
	"file": this.state.load['fileobj'].filter((f) => f.device === this.state.config['device']).map((f) => f.file),
      }
    }))
    .then(() => this._getfile());
  }

  _getfile() {
    fetch(this.state.load['fileobj'].filter((f) => ( f.device === this.state.config['device'] && f.file === this.state.config['file'] )).map((f) => f.url)[0])
    .then((r) => r.json())
    .then((j) => j.content)
    .then((c) => atob(c))
    .then((config) => this.setState({
	    config: {
	      ...this.state.config,
	    },
	    load: {
	      ...this.state.load,
	      "config": config
	    }
    }));
  }

  _tmplrealname = () => this.state.config.file === undefined ? "config.txt" : this.state.config.file.replace(".tmpl", "")

  _save = (event) => {
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
  }

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
    return (
      <form className="flex flex-column">
        {this.renderInput("Configs Version", "version", this.state.load['version'])}
        {this.renderInput("Device", "device", this.state.load['device'] )}
        {this.renderInput("File", "file", this.state.load['file'] )}
        { tags.map((t) => this.renderInput(t, t)) }
	<button onClick={this._save}>Download Config</button>
      </form>
    );
  }

  renderInput(label, id, options) {
    let selectoptions = [];
    if ( options ) {
      selectoptions = options.map((c) => ( <option key={c} value={c}>{c}</option>));
    }
    let onchangefunc = (event) => {
        this.setState({
         config: {
            ...this.state.config,
            [id]: event.target.value
          }
        });
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
        {options ? ( <select props={p} onChange={onchangefunc}>{selectoptions}</select> ) : ( <input props={p} onChange={onchangefunc}/> ) }
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
