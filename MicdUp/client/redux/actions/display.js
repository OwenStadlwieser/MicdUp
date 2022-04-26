import {
  DISPLAY_MESSAGE,
  HIDE_MESSAGE,
  NAVIGATE,
  VIEW_PROFILE,
  VIEW_PROFILE_SEARCH,
  RECEIVE_NOTIF,
  HIDE_NOTIF,
  SHOW_COMMENTS,
  ADD_LOADING,
  REMOVE_LOADING,
  SET_CURRENT_KEY,
  VIEW_TAG_SEARCH,
  SHOW_HEADER,
  SET_LIST,
  SHOW_SOUND_MODAL,
} from "../types";

import { createNavigationContainerRef } from "@react-navigation/native";
export const navigationRef = createNavigationContainerRef();
export const navigationRefSearch = createNavigationContainerRef();
export const setCurrentKey = (payload) => (dispatch) => {
  dispatch({
    type: SET_CURRENT_KEY,
    payload,
  });
};

export const showSoundModal = (payload) => (dispatch) => {
  dispatch({
    type: SHOW_SOUND_MODAL,
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
  if (navigationRef.isReady()) {
    navigationRef.navigate("Comment");
  }
  dispatch({
    type: SHOW_COMMENTS,
    payload,
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

export const setList = (payload) => (dispatch) => {
  if (navigationRef.isReady()) {
    navigationRef.navigate("ListOfAccounts");
  }
  dispatch({
    type: SET_LIST,
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
  if (navigationRef.isReady()) {
    navigationRef.navigate("SearchProfile");
  }
};

export const searchViewTag = (payload) => (dispatch) => {
  dispatch({
    type: VIEW_TAG_SEARCH,
    payload,
  });
  if (navigationRef.isReady()) {
    navigationRef.navigate("SearchFeed");
  }
};

export const searchNavigate =
  (payload = "Search") =>
  (dispatch) => {
    console.log(navigationRefSearch.isReady());
    if (navigationRefSearch.isReady()) {
      navigationRefSearch.navigate(payload);
    }
  };
