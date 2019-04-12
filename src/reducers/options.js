import { createReducer } from "redux-starter-kit";
// import { SET_VERSION, SET_DEVICE, SET_TEMPLATE } from "../actions/options";
// import { SET_VERSIONS, SET_DEVICES, SET_TEMPLATES } from "../actions/templates";

export default createReducer(
  {
    version: undefined,
    device: undefined,
    template: undefined
  },
  {
    SET_VERSION: (state, action) => {
      state.version = action.version;
      state.device = undefined;
      state.template = undefined;
    },
    SET_DEVICE: (state, action) => {
      state.device = action.device;
      state.template = undefined;
    },
    SET_TEMPLATE: (state, action) => {
      state.template = action.template;
    },

    // If loaded but no version, device or template set, default to first
    SET_VERSIONS: (state, action) => {
      state.version = state.version || action.versions[0];
    },
    SET_DEVICES: (state, action) => {
      state.device = state.device || action.devices[0];
    },
    SET_TEMPLATES: (state, action) => {
      state.template = state.template || action.templates[0];
    }
  }
);
