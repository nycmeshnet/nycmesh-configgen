import { createReducer } from "redux-starter-kit";
// import { SET_VERSIONS } from "../actions/templates";

export default createReducer([], {
	SET_VERSIONS: (state, action) => action.versions
});
