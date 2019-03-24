import { createReducer } from "redux-starter-kit";
import { SET_VALUE } from "../actions/config";

export default createReducer(
	{},
	{
		SET_VALUE: (state, action) => {
			state[action.key] = action.value;
		}
	}
);
