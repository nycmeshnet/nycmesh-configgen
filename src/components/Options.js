import React from "react";

function Options({
  versions,
  devices,
  templates,
  selectedVersion,
  selectedDevice,
  selectedTemplate,
  onVersionSelected,
  onDeviceSelected,
  onTemplateSelected,
}) {
  return (
    <div className="w-100">
      <Section
        label="Version"
        options={versions}
        selected={selectedVersion}
        onChange={onVersionSelected}
      />
      <Section
        label="Device"
        options={devices}
        selected={selectedDevice}
        onChange={onDeviceSelected}
      />
      <Section
        label="Template"
        options={templates}
        selected={selectedTemplate}
        onChange={onTemplateSelected}
      />
    </div>
  );
}

function Section({ label, options, selected, onChange }) {
  if (!options) return null;
  if (!options.length) return "None found!";

  // Hacky way to support objects as options
  const getName = (option) =>
    typeof option === "object" ? option.name : option;
  const nameMap = options.reduce((acc, cur) => {
    acc[getName(cur)] = cur;
    return acc;
  }, {});

  return (
    <div className="w-100 flex items-center justify-between mv2">
      <label htmlFor="device">{label}</label>
      <select
        name="version"
        value={getName(selected)}
        onChange={({ target }) => onChange && onChange(nameMap[target.value])}
      >
        {options.map((option) => {
          const name = getName(option);
          return (
            <option key={name} value={name}>
              {name}
            </option>
          );
        })}
      </select>
    </div>
  );
}

export default Options;
