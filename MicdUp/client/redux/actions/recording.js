import {
  ALTER_CLIPS,
  UPDATE_TITLE,
  UPDATE_TAGS,
  CLEAR_RECORDING,
  NAVIGATE,
} from "../types";
import { UPLOAD_RECORDING_MUTATION } from "../../apollo/private/recording";
import { client } from "../../apollo/client";

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

export const uploadRecording =
  (files, fileTypes, tags, nsfw, allowRebuttal, allowStitch, privatePost) =>
  async (dispatch) => {
    try {
      console.log(tags);
      const res = await client.mutate({
        mutation: UPLOAD_RECORDING_MUTATION,
        variables: {
          files,
          fileTypes,
          tags,
          nsfw,
          allowRebuttal,
          allowStitch,
          privatePost,
        },
        fetchPolicy: "no-cache",
      });
      dispatch({
        type: CLEAR_RECORDING,
      });
      dispatch({
        type: NAVIGATE,
        payload: "Feed",
      });
      console.log(res);
    } catch (err) {
      console.log(err);
    }
  };

export const combineAudioUrlsWeb = (payload) => async (dispatch) => {};
