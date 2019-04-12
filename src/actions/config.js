export const SET_VALUE = "SET_VALUE";

export function setValue(key, value, dispatch) {
	dispatch({ type: SET_VALUE, key, value });
}
