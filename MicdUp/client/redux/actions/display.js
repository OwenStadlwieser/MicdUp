import {
  CHANGE_LOGIN,
  CHANGE_SIGNUP,
  DISPLAY_MESSAGE,
  HIDE_MESSAGE,
  NAVIGATE,
  VIEW_PROFILE,
  VIEW_PROFILE_SEARCH,
  RECEIVE_NOTIF,
  HIDE_NOTIF,
  SHOW_COMMENTS,
  HIDE_COMMENTS,
  ADD_LOADING,
  REMOVE_LOADING,
  SET_CURRENT_KEY,
  VIEW_TAG_SEARCH,
  SHOW_HEADER,
} from "../types";

import { createNavigationContainerRef } from "@react-navigation/native";
export const navigationRef = createNavigationContainerRef();

export const setCurrentKey = (payload) => (dispatch) => {
  dispatch({
    type: SET_CURRENT_KEY,
    payload,
  });
};

export const addLoading = (payload) => (dispatch) => {
  dispatch({
    type: ADD_LOADING,
    payload,
  });
};

export const removeLoading = (payload) => (dispatch) => {
  dispatch({
    type: REMOVE_LOADING,
    payload,
  });
};

export const receiveNotif = (payload) => (dispatch) => {
  dispatch({
    type: RECEIVE_NOTIF,
    payload,
  });
};

export const showComments = (payload) => (dispatch) => {
  dispatch({
    type: SHOW_COMMENTS,
    payload,
  });
};

export const hideComments = () => (dispatch) => {
  dispatch({
    type: HIDE_COMMENTS,
  });
};

export const hideNotif = (payload) => (dispatch) => {
  dispatch({
    type: HIDE_NOTIF,
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

export const showHeader = (payload) => (dispatch) => {
  dispatch({
    type: SHOW_HEADER,
    payload,
  });
};
export const navigate = (payload) => (dispatch) => {
  if (navigationRef.isReady()) {
    navigationRef.navigate(payload);
  }
  dispatch({
    type: NAVIGATE,
    payload,
  });
};

export const navigateStateChanged = (payload) => (dispatch) => {
  if (navigationRef.isReady()) {
    dispatch({
      type: NAVIGATE,
      payload: navigationRef.current.getCurrentRoute().name,
    });
  }
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

export const searchViewTag = (payload) => (dispatch) => {
  dispatch({
    type: VIEW_TAG_SEARCH,
    payload,
  });
};
