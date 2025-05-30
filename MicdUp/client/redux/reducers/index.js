import { combineReducers } from "redux";
import auth from "./auth";
import display from "./display";
import recording from "./recording";
import chat from "./chat";
import sound from "./sound";
import { LOG_OUT } from "../types";

const appReducer = combineReducers({ auth, display, recording, chat, sound });
const rootReducer = (state, action) => {
  if (action.type === LOG_OUT) {
    return appReducer(undefined, action);
  }

  return appReducer(state, action);
};

export default rootReducer;
