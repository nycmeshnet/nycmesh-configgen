import Mustache from "mustache";
import React, { PureComponent } from "react";
import { fetch } from 'whatwg-fetch';
// import IpSubnetCalculator from "ip-subnet-calculator";
// import omni from "./nycmesh-omnitik-v3.2-mustache.js"
// import omni from "./nycmesh-omnitik-v3.2.js"

let repobase = "https://api.github.com/repos/nycmeshnet/nycmesh-configs/"

class App extends PureComponent {
  state = {
    config: {},
    load: {
      tags: [],
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
    // let tags = omni.tags();
    // config: tags.reduce( (acc, i) => { acc[i] = ""; return acc; } , {})
    this.setState({
      load: {
        ...this.state.load,
      },
    })
    this._loadtags();
  }

  _loadtags() {
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
    .then(() => this._loadfilenames());
  }

  _loadfilenames() {
    fetch(repobase + 'git/trees/' + this.state.config.version)
    .then((r) => r.json())
    .then((j) => j.tree.filter((i) => i.type === "tree"))
    .then((j) => j.map((i) =>  
	    fetch(i.url)
	    .then((r) => r.json())
	    .then((j) => j.tree.filter((c) => c.path === "config.rsc.tmpl"))
	    .then((j) => ({ "path": i.path, "url": j[0].url }) )
    ))
    .then((i) => Promise.all(i)
    	.then((files) => this.setState({
	      config: {
	        ...this.state.config,
	        "file": files.map((f) => f.path)[0]
	      },
	      load: {
	        ...this.state.load,
	        "fileobj": files.reduce((acc,cur) => { acc[cur['path']] = cur; return acc; }, {}),
		"file": files.map((f) => f.path)
	      }
	    }))
    )
    .then(() => this._getfile());
  }

  _getfile() {
    fetch(this.state.load['fileobj'][this.state.config['file']]['url'])
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

  _save = (event) => {
	event.preventDefault();
        var text = this.filerender(this.state.config);
        var fileName = "config.rsc";
        var blob = new Blob([text], {
          type: "text/csv;charset=utf8;"
        });

        var element = document.createElement("a");
        document.body.appendChild(element);
        element.setAttribute("href", window.URL.createObjectURL(blob));
        element.setAttribute("download", fileName);
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
    // { this.state.load.tags.map((t) => this.renderInput(t, t)) }
    return (
      <form className="flex flex-column">
        {this.renderInput("Configs Version", "version", this.state.load['version'])}
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
