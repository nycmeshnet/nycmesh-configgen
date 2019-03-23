import Mustache from "mustache";
import React, { PureComponent } from "react";

const REPO_BASE = "https://api.github.com/repos/nycmeshnet/nycmesh-configs/";

class App extends PureComponent {
  state = {
    currentVersion: undefined,
    currentDevice: undefined,
    currentTemplate: undefined,

    versions: [],
    devices: {}, // version: devices
    templates: {}, // version: device : templates
    config: {}
  };

  componentDidMount() {
    this.loadVersions();
  }

  componentDidUpdate(prevProps, prevState) {
    const { currentVersion, currentDevice } = this.state;
    if (currentVersion && currentVersion !== prevState.currentVersion) {
      this.loadDevices();
    }

    if (currentDevice && currentDevice !== prevState.currentDevice) {
      this.loadTemplates();
    }
  }

  loadVersions() {
    get(REPO_BASE + "tags")
      .then(j => j.map(i => i.name)) // Branch names are version names
      .then(versions =>
        this.setState({
          versions,
          currentVersion: versions[0]
        })
      )
      .catch(error => console.error(error));
  }

  loadDevices() {
    const { currentVersion } = this.state;
    // Fetch all devices
    get(REPO_BASE + "git/trees/" + currentVersion)
      .then(({ tree }) => tree.filter(i => i.type === "tree")) // Folders are devices
      .then(deviceFolders => {
        return deviceFolders.map(device => ({
          name: device.path,
          URL: device.url
        }));
      })
      .then(devices => {
        this.setState({
          devices: {
            ...this.state.devices,
            [currentVersion]: devices
          },
          currentDevice: devices[0].name
        });
      })
      .catch(error => console.error(error));
  }

  loadTemplates() {
    const { devices, currentVersion, currentDevice } = this.state;
    if (!devices) return null;
    // TODO: Less hacky
    const matchingDevices = devices[currentVersion].filter(
      device => device.name === currentDevice
    );
    if (!matchingDevices.length) return;
    const fullCurrentDevice = matchingDevices[0];
    get(fullCurrentDevice.URL)
      // List all templates
      .then(({ tree }) =>
        tree.filter(file => file.path.match(new RegExp(".tmpl$")))
      )
      // Fetch all templates
      .then(templateFiles => {
        Promise.all(
          templateFiles.map(templateFile =>
            get(templateFile.url).then(({ content }) => ({
              name: templateFile.path,
              content
            }))
          )
        ).then(deviceTemplates =>
          this.setState({
            templates: {
              ...this.state.templates,
              [currentVersion]: {
                ...this.state.templates[currentVersion],
                [currentDevice]: deviceTemplates
              }
            },
            currentTemplate: deviceTemplates[0].name
          })
        );
      })
      .catch(error => console.error(error));
  }

  downloadConfig() {
    const { config } = this.state;
    const currentTemplate = this.currentTemplate();
    if (!currentTemplate) return null;

    const fileName = config.file
      ? config.file.replace(".tmpl", "")
      : "config.txt";
    const { content } = currentTemplate;
    const configText = Mustache.render(atob(content), config);
    var blob = new Blob([configText], {
      type: "text/csv;charset=utf8;" // Why csv??
    });

    var element = document.createElement("a");
    document.body.appendChild(element);
    element.setAttribute("href", window.URL.createObjectURL(blob));
    element.setAttribute("download", fileName);
    element.style.display = "";
    element.click();
    document.body.removeChild(element);
  }

  // TODO: Less hacky
  currentTemplate() {
    const {
      currentTemplate,
      currentVersion,
      currentDevice,
      templates
    } = this.state;
    if (!currentTemplate || !templates) return null;
    const versionDevices = templates[currentVersion];
    if (!versionDevices) return null;
    const currentTemplates = versionDevices[currentDevice];
    if (!currentTemplates) return null;
    const matchingTemplates = currentTemplates.filter(
      template => template.name === currentTemplate
    );
    if (!matchingTemplates.length) return null;
    const fullCurrentTemplate = matchingTemplates[0];
    return fullCurrentTemplate;
  }

  render() {
    return (
      <div className="flex flex-column flex-row-l justify-end f5">
        {this.renderForm()}
        {this.renderScript()}
      </div>
    );
  }

  renderForm() {
    return (
      <div className="fixed-ns top-0 bottom-0 left-0 bg-near-white w-third-l w-100 pa4 unselectable">
        <form
          className="flex flex-column"
          onSubmit={event => {
            event.preventDefault();
            this.downloadConfig();
          }}
        >
          {this.renderVersionInput()}
          {this.renderDeviceInput()}
          {this.renderTemplateInput()}
          {this.renderTagInputs()}
          {this.renderDownload()}
        </form>
      </div>
    );
  }

  // TODO: Less hacky
  renderVersionInput() {
    const { versions, currentVersion } = this.state;
    if (!versions || !currentVersion) return null;
    return (
      <div className="flex items-center justify-between mv2">
        <label htmlFor="device">Configs Version</label>
        <select
          name="version"
          onChange={({ target }) =>
            this.setState({ currentVersion: target.value })
          }
        >
          {versions.map(version => (
            <option key={version} value={version}>
              {version}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // TODO: Less hacky
  renderDeviceInput() {
    const { devices, currentVersion } = this.state;
    if (!currentVersion || !devices) return null;
    const versionDevices = devices[currentVersion];
    if (!versionDevices) return null;
    return (
      <div className="flex items-center justify-between mv2">
        <label htmlFor="device">Device</label>
        <select
          name="device"
          onChange={({ target }) =>
            this.setState({ currentDevice: target.value })
          }
        >
          {versionDevices.map(device => (
            <option key={device.name} value={device.name}>
              {device.name}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // TODO: Less hacky
  renderTemplateInput() {
    const {
      templates,
      currentVersion,
      currentDevice,
      currentTemplate
    } = this.state;
    if (!templates || !currentVersion || !currentDevice || !currentTemplate)
      return null;
    const versionDevices = templates[currentVersion];
    if (!versionDevices) return null;
    const deviceTemplates = versionDevices[currentDevice];
    if (!deviceTemplates) return null;
    return (
      <div className="flex items-center justify-between mv2">
        <label htmlFor="device">Template</label>
        <select
          name="template"
          onChange={({ target }) =>
            this.setState({ currentTemplate: target.value })
          }
        >
          {deviceTemplates.map(template => (
            <option key={template.name} value={template.name}>
              {template.name}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // TODO: Less hacky
  renderTagInputs() {
    const currentTemplate = this.currentTemplate();
    if (!currentTemplate) return null;
    const { content } = currentTemplate;

    // Not sure what this does
    const tags = Mustache.parse(atob(content)).reduce(
      (acc, i) =>
        !acc.includes(i[1]) && i[0] === "name" ? acc.concat(i[1]) : acc,
      []
    );
    return tags.map(tag => this.renderInput(tag, tag));
  }

  renderInput(label, id, options, ocf) {
    const { config } = this.state;
    return (
      <div key={id} className="flex items-center justify-between mv2">
        <label htmlFor={id}>{label}</label>
        <input
          name={id}
          required
          spellCheck={false}
          value={config[id]}
          className="flex w-100 ml3 mw5"
          onChange={({ target }) =>
            this.setState({
              config: {
                ...this.state.config,
                [id]: target.value
              }
            })
          }
        />
      </div>
    );
  }

  renderDownload() {
    const { currentVersion, currentTemplate, currentDevice } = this.state;
    if (!currentVersion || !currentTemplate || !currentDevice) return null;

    return (
      <button className="pa3 bn bg-blue white br2 fw5 mt3 pointer">
        Download Config
      </button>
    );
  }

  renderScript() {
    const { config } = this.state;
    const currentTemplate = this.currentTemplate();
    if (!currentTemplate) return null;
    return (
      <div className="w-two-thirds-l w-100 overflow-x-scroll pa4 bg-bluec">
        <pre className="mv0">
          <code>{Mustache.render(atob(currentTemplate.content), config)}</code>
        </pre>
      </div>
    );
  }
}

function get(URL) {
  try {
    return fetch(URL).then(response => {
      if (response.status !== 200) {
        alert("GitHub request failed!");
      }
      return response.json();
    });
  } catch (error) {
    alert(error);
  }
}

export default App;
