import {
  CHANGE_LOGIN,
  CHANGE_SIGNUP,
  DISPLAY_MESSAGE,
  HIDE_MESSAGE,
} from "../types";

export const changeLogin = (payload) => (dispatch) => {
  dispatch({
    type: CHANGE_LOGIN,
    payload,
  });
};
export const changeSignup = (payload) => (dispatch) => {
  dispatch({
    type: CHANGE_SIGNUP,
    payload,
  });
};
export const showMessage = (payload) => (dispatch) => {
  dispatch({
    type: DISPLAY_MESSAGE,
    payload,
  });
  setTimeout(() => {
    dispatch({
      type: HIDE_MESSAGE,
    });
  }, 3000);
};
