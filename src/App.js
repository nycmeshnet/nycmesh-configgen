import React, { useState, useEffect } from "react";
import Mustache from "mustache";
import qs from "qs";

import Options from "./components/Options";
import Tags from "./components/Tags";
import Script from "./components/Script";

import { fetchVersions, fetchDevices, fetchTemplates } from "./api/github";

function App() {
  const [versions, setVersions] = useState();
  const [devices, setDevices] = useState();
  const [templates, setTemplates] = useState();

  const [selectedVersion, setSelectedVersion] = useState();
  const [selectedDevice, setSelectedDevice] = useState();
  const [selectedTemplate, setSelectedTemplate] = useState();

  const [tagValues, setTagValues] = useState({});

  const params = qs.parse(window.location.search.replace("?", ""));

  // Fetch versions
  useEffect(() => {
    asyncFunc();
    async function asyncFunc() {
      const versions = await fetchVersions();
      setVersions(versions);
      const paramVersion = versions.filter((v) => v === params.version)[0];
      setSelectedVersion(paramVersion || versions[0]);
    }
  }, []);

  // Fetch devices for selected version
  useEffect(() => {
    if (!selectedVersion) return;
    asyncFunc();
    async function asyncFunc() {
      const devices = await fetchDevices(selectedVersion);
      setDevices(devices);
      const paramDevice = devices.filter((d) => d.name === params.device)[0];
      setSelectedDevice(paramDevice || devices[0]);
    }
  }, [selectedVersion]);

  // Fetch templates for selected device and version
  useEffect(() => {
    if (!selectedVersion || !selectedDevice) return;
    asyncFunc();
    async function asyncFunc() {
      const templates = await fetchTemplates(selectedVersion, selectedDevice);
      const paramTemplate = templates.filter(
        (t) => t.name === params.template
      )[0];
      setTemplates(templates);
      setSelectedTemplate(paramTemplate || templates[0]);
    }
  }, [selectedVersion, selectedDevice]);

  const tags = selectedTemplate
    ? Mustache.parse(selectedTemplate.content).reduce(
        (acc, i) =>
          !acc.includes(i[1]) && i[0] === "name" ? acc.concat(i[1]) : acc,
        []
      )
    : null;

  const onVersionSelected = (version) => {
    setSelectedVersion(version);
    setSelectedDevice();
    setSelectedTemplate();
    setDevices();
    setTemplates();
    setQuery({ version });
  };

  const onDeviceSelected = (device) => {
    setSelectedDevice(device);
    setSelectedTemplate();
    setTemplates();
    setQuery({ version: selectedVersion, device: device.name });
  };

  const onTemplateSelected = (template) => {
    setSelectedTemplate(template);
    setQuery({
      version: selectedVersion,
      device: selectedDevice.name,
      template: template.name,
    });
  };

  const onTagChange = (key, value) => {
    setTagValues({ ...tagValues, [key]: value });
  };

  const onSubmit = (event) => {
    event.preventDefault();
    downloadConfig(selectedTemplate, tagValues);
  };

  return (
    <div className="vh-100-l flex flex-row-l flex-column f5">
      <div className="bg-near-white measure-l w-100 pa4 unselectable br b--light-gray">
        <form className="flex flex-column items-end" onSubmit={onSubmit}>
          <Options
            versions={versions}
            devices={devices}
            templates={templates}
            selectedVersion={selectedVersion}
            selectedDevice={selectedDevice}
            selectedTemplate={selectedTemplate}
            onVersionSelected={onVersionSelected}
            onDeviceSelected={onDeviceSelected}
            onTemplateSelected={onTemplateSelected}
          />
          <Tags tags={tags} tagValues={tagValues} onChange={onTagChange} />
          {selectedVersion && selectedDevice && selectedTemplate && (
            <input
              type="submit"
              value="Download config"
              className="mt3 pa2 pointer"
            />
          )}
        </form>
      </div>
      <div className="w-100 h-100 overflow-y-scroll">
        <Script template={selectedTemplate} tagValues={tagValues} />
      </div>
    </div>
  );
}

export default App;

function setQuery(params) {
  window.history.replaceState(
    null,
    null,
    window.location.pathname + "?" + qs.stringify(params)
  );
}

function downloadConfig(template, tags) {
  if (!template || !tags) return null;

  const { name, content } = template;
  const fileName = name
    ? name.replace("nnnn", tags.nodenumber).replace(".tmpl", "")
    : "config.txt";
  const configText = Mustache.render(content, tags);
  var blob = new Blob([configText], {
    type: "text/csv;charset=utf8;", // Why csv??
  });

  var element = document.createElement("a");
  document.body.appendChild(element);
  element.setAttribute("href", window.URL.createObjectURL(blob));
  element.setAttribute("download", fileName);
  element.style.display = "";
  element.click();
  document.body.removeChild(element);
}
