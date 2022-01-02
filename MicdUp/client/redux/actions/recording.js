import { ALTER_CLIPS, UPDATE_TITLE, UPDATE_TAGS } from "../types";

export const updateClips = (payload) => (dispatch) => {
  dispatch({
    type: ALTER_CLIPS,
    payload,
  });
};

export const updateTitle = (payload) => (dispatch) => {
  dispatch({
    type: UPDATE_TITLE,
    payload,
  });
};

export const updateTags = (payload) => (dispatch) => {
  dispatch({
    type: UPDATE_TAGS,
    payload,
  });
};
