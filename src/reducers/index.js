import { combineReducers, createStore } from "redux";
import configReducer from "./config";
import devicesReducer from "./devices";
import optionsReducer from "./options";
import templatesReducer from "./templates";
import versionsReducer from "./versions";

const reducer = combineReducers({
	config: configReducer,
	devices: devicesReducer,
	options: optionsReducer,
	templates: templatesReducer,
	versions: versionsReducer
});

const store = createStore(reducer);

export default store;
