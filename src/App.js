import React, { PureComponent } from "react";
import generateScript from "./nycmesh-omnitik-v3.2.js";

class App extends PureComponent {
  state = {
    config: {
      nodenumber: "", // 1111
      bgpasn: "", // 61111
      ipprefix: "", // "10.70.111"
      iptenantsrange: "", // 10.70.111.5-10.70.111.119
      iptenantsgw: "", // 10.70.111.1
      ippublicrange: "", // 10.70.111.130-10.70.111.180
      ippublicgw: "", // 10.70.111.129
      dns: "" // 10.10.10.10,1.1.1.1
    }
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
    return (
      <form className="flex flex-column">
        {this.renderInput("Node Number", "nodenumber")}
        {this.renderInput("BGP ASN", "bgpasn")}
        {this.renderInput("IP Prefix", "ipprefix")}
        {this.renderInput("IP Tenants Range", "iptenantsrange")}
        {this.renderInput("IP Tenants Gateway", "iptenantsgw")}
        {this.renderInput("IP Public Range", "ippublicrange")}
        {this.renderInput("IP Public Gateway", "ippublicgw")}
        {this.renderInput("DNS", "dns")}
      </form>
    );
  }

  renderInput(label, id) {
    return (
      <div className="flex items-center justify-between mv2">
        <label htmlFor={id}>{label}</label>
        <input
          id={id}
          required
          value={this.state.config[id]}
          spellCheck={false}
          onChange={event =>
            this.setState({
              config: {
                ...this.state.config,
                [id]: event.target.value
              }
            })
          }
        />
      </div>
    );
  }

  renderScript() {
    const { config } = this.state;
    const scriptText = generateScript(config);
    return (
      <pre className="mv0">
        <code>{scriptText}</code>
      </pre>
    );
  }
}

export default App;
