export const SET_VERSION = "SET_VERSION";
export const SET_DEVICE = "SET_DEVICE";
export const SET_TEMPLATE = "SET_TEMPLATE";

export function setVersion(version, dispatch) {
	dispatch({ type: SET_VERSION, version });
}

export function setDevice(device, dispatch) {
	dispatch({ type: SET_DEVICE, device });
}

export function setTemplate(template, dispatch) {
	dispatch({ type: SET_TEMPLATE, template });
}
