import { connect } from "react-redux";
import PureComponent from "./component";
import {
	loadVersions,
	loadDevices,
	loadTemplates
} from "../../actions/templates";
import { setVersion, setDevice, setTemplate } from "../../actions/options";
import { setValue } from "../../actions/config";

const mapStateToProps = (state, ownProps) => {
	const { version, device = {} } = state.options;
	const versionDevices = state.devices[version];
	const versionTemplates = state.templates[version] || {};
	const versionDeviceTemplates = versionTemplates[device.name];
	return {
		versions: state.versions,
		devices: versionDevices,
		templates: versionDeviceTemplates,
		options: state.options,
		config: state.config
	};
};

const mapDispatchToProps = (dispatch, ownProps) => ({
	loadVersions: () => loadVersions(dispatch),
	loadDevices: version => loadDevices(version, dispatch),
	loadTemplates: (device, version) =>
		loadTemplates(device, version, dispatch),
	setVersion: version => setVersion(version, dispatch),
	setDevice: device => setDevice(device, dispatch),
	setTemplate: template => setTemplate(template, dispatch),
	setValue: (key, value) => setValue(key, value, dispatch)
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(PureComponent);
