import { ALTER_CLIPS } from "../types";

export const updateClips = (payload) => (dispatch) => {
  dispatch({
    type: ALTER_CLIPS,
    payload,
  });
};
