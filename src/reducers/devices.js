import { createReducer } from "redux-starter-kit";
// import { SET_DEVICES } from "../actions/templates";

export default createReducer(
	{},
	{
		SET_DEVICES: (state, action) => {
			state[action.version] = action.devices;
		}
	}
);
