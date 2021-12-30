import { combineReducers } from "redux";
import auth from "./auth";
import display from "./display";
import { LOG_OUT } from "../types";

const appReducer = combineReducers({ auth, display });
const rootReducer = (state, action) => {
  if (action.type === LOG_OUT) {
    return appReducer(undefined, action);
  }

  return appReducer(state, action);
};

export default rootReducer;
