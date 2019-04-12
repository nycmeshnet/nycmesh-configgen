import React, { PureComponent } from "react";
import Mustache from "mustache";
import qs from "qs";

export default class Options extends PureComponent {
	constructor(props) {
		super(props);
		const { location, setVersion, loadVersions } = props;

		// Set version from params
		const params = qs.parse(location.search.replace("?", ""));
		if (params.version) {
			setVersion(params.version);
		}

		loadVersions();
	}

	componentDidUpdate(prevProps) {
		const {
			options,
			versions,
			devices,
			templates,
			history,
			location,
			loadDevices,
			loadTemplates,
			setDevice,
			setTemplate
		} = this.props;
		const { version, device, template } = options;

		const versionChanged = version && version !== prevProps.options.version;
		const deviceChanged = device && device !== prevProps.options.device;
		const templateChanged =
			template && template !== prevProps.options.template;
		const configChanged =
			versionChanged || deviceChanged || templateChanged;
		const everythingLoaded =
			version && device && template && versions && devices && templates;

		if (versionChanged) {
			loadDevices(version);
		}

		if (deviceChanged) {
			loadTemplates(device, version);
		}

		if (configChanged && everythingLoaded) {
			history.push({
				search: qs.stringify({
					version,
					device: device.name,
					template: template.name
				})
			});
		}

		// Get URL Params
		const { search } = location;
		const params = qs.parse(search.replace("?", ""));
		const loadedDevices = devices && !prevProps.devices;
		const loadedTemplates = templates && !prevProps.templates;

		// Select device from params upon loading
		if (loadedDevices) {
			const { device: deviceName } = params;
			if (deviceName) {
				const matchingDevices = devices.filter(
					d => d.name === deviceName
				);
				if (matchingDevices.length) {
					setDevice(matchingDevices[0]);
				}
			}
		}

		// Select template from params upon loading
		if (loadedTemplates) {
			const { template: templateName } = params;
			if (templateName) {
				const matchingTemplates = templates.filter(
					t => t.name === templateName
				);
				if (matchingTemplates.length) {
					setTemplate(matchingTemplates[0]);
				}
			}
		}
	}

	render() {
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
		const { versions, options, setVersion } = this.props;
		if (!versions.length) return null;
		return (
			<div className="flex items-center justify-between mv2">
				<label htmlFor="device">Configs Version</label>
				<select
					name="version"
					value={options.version}
					onChange={({ target }) => setVersion(target.value)}
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
		const { devices, options, setDevice } = this.props;
		if (!devices) return null;
		return (
			<div className="flex items-center justify-between mv2">
				<label htmlFor="device">Device</label>
				<select
					name="device"
					value={devices.indexOf(options.device)}
					onChange={({ target }) => setDevice(devices[target.value])}
				>
					{devices.map((device, index) => (
						<option key={device.name} value={index}>
							{device.name}
						</option>
					))}
				</select>
			</div>
		);
	}

	// TODO: Less hacky
	renderTemplateInput() {
		const { templates, options, setTemplate } = this.props;
		if (!templates) return null;
		return (
			<div className="flex items-center justify-between mv2">
				<label htmlFor="device">Template</label>
				<select
					name="template"
					onChange={({ target }) =>
						setTemplate(templates[target.value])
					}
					value={templates.indexOf(options.template)}
				>
					{templates.map((template, index) => (
						<option key={template.name} value={index}>
							{template.name}
						</option>
					))}
				</select>
			</div>
		);
	}

	// TODO: Less hacky
	renderTagInputs() {
		const { options } = this.props;
		const { template } = options;
		if (!template) return null;

		// Not sure what this does
		const parsed = Mustache.parse(template.content);
		const tags = parsed.reduce(
			(acc, i) =>
				!acc.includes(i[1]) && i[0] === "name" ? acc.concat(i[1]) : acc,
			[]
		);
		return tags.map(tag => this.renderInput(tag, tag));
	}

	renderInput(label, key, options, ocf) {
		const { config, setValue } = this.props;
		return (
			<div key={key} className="flex items-center justify-between mv2">
				<label htmlFor={key}>{label}</label>
				<input
					name={key}
					required
					spellCheck={false}
					value={config[key] || ""}
					className="flex w-100 ml3 mw5"
					onChange={({ target }) => setValue(key, target.value)}
				/>
			</div>
		);
	}

	renderDownload() {
		const { options } = this.props;
		const { version, device, template } = options;
		if (!version || !device || !template) return null;

		// TODO: Validate tag inputs

		return (
			<input
				type="submit"
				value="Download Config"
				className="pa3 bn bg-blue white br2 fw5 mt3 pointer"
			/>
		);
	}

	downloadConfig() {
		const { config, options } = this.props;
		const { template } = options;
		if (!template) return null;

		const { name, content } = template;
		const fileName = name
			? name.replace("nnnn", config.nodenumber).replace(".tmpl", "")
			: "config.txt";
		const configText = Mustache.render(content, config);
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
}
