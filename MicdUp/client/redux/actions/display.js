import {
  CHANGE_LOGIN,
  CHANGE_SIGNUP,
  DISPLAY_MESSAGE,
  HIDE_MESSAGE,
  NAVIGATE,
  VIEW_PROFILE,
  VIEW_PROFILE_SEARCH,
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

export const navigate = (payload) => (dispatch) => {
  dispatch({
    type: NAVIGATE,
    payload,
  });
};

export const viewProfile = (payload) => (dispatch) => {
  dispatch({
    type: VIEW_PROFILE,
    payload,
  });
};

export const searchViewProfile = (payload) => (dispatch) => {
  dispatch({
    type: VIEW_PROFILE_SEARCH,
    payload,
  });
};
