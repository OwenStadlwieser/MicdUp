import {
  CHANGE_LOGIN,
  CHANGE_SIGNUP,
  DISPLAY_MESSAGE,
  HIDE_MESSAGE,
} from "../types";

const initialState = {
  showLogin: false,
  showSignup: false,
  displayMessage: false,
  currentMessage: "",
  messageState: false,
};

export default function (state = { ...initialState }, action) {
  const { type, payload } = action;
  switch (type) {
    case CHANGE_LOGIN:
      return {
        ...state,
        showLogin: payload,
      };
    case CHANGE_SIGNUP:
      return {
        ...state,
        showSignup: payload,
      };
    case DISPLAY_MESSAGE:
      return {
        ...state,
        displayMessage: true,
        currentMessage: payload.message,
        messageState: payload.success,
      };
    case HIDE_MESSAGE:
      return {
        ...state,
        displayMessage: false,
        currentMessage: "",
        messageState: false,
      };
    default:
      return state;
  }
}
