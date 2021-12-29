import { combineReducers } from "redux";
import auth from "./auth";
import display from "./display";
export default combineReducers({ auth, display });
