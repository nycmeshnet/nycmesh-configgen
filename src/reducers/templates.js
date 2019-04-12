import { createReducer } from "redux-starter-kit";
// import { SET_TEMPLATES } from "../actions/templates";

export default createReducer(
	{},
	{
		SET_TEMPLATES: (state, action) => {
			state[action.version] = state[action.version] || {};
			state[action.version][action.device.name] = action.templates;
		}
	}
);
