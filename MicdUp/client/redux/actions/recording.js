import {
  ALTER_CLIPS,
  UPDATE_TITLE,
  UPDATE_TAGS,
  CLEAR_RECORDING,
  NAVIGATE,
  SET_BIO,
  SET_POSTS,
} from "../types";
import {
  UPLOAD_RECORDING_MUTATION,
  UPLOAD_BIO_MUTATION,
  GET_USER_POSTS_QUERY,
} from "../../apollo/private/recording";
import { client } from "../../apollo/client";
import { showMessage } from "./display";
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
  (
    files,
    fileTypes,
    title,
    tags,
    nsfw,
    allowRebuttal,
    allowStitch,
    privatePost
  ) =>
  async (dispatch) => {
    try {
      const res = await client.mutate({
        mutation: UPLOAD_RECORDING_MUTATION,
        variables: {
          files,
          fileTypes,
          title,
          tags,
          nsfw,
          allowRebuttal,
          allowStitch,
          privatePost,
        },
        fetchPolicy: "no-cache",
      });
      if (!res.data || !res.data.createRecording) {
        dispatch(
          showMessage({
            success: false,
            message: "Something went wrong. Please contact support.",
          })
        );
        return;
      }
      dispatch({
        type: CLEAR_RECORDING,
      });
      dispatch({
        type: NAVIGATE,
        payload: "Feed",
      });
    } catch (err) {
      console.log(err);
    }
  };

export const uploadBio = (files, fileTypes) => async (dispatch) => {
  try {
    const res = await client.mutate({
      mutation: UPLOAD_BIO_MUTATION,
      variables: {
        files,
        fileTypes,
      },
      fetchPolicy: "no-cache",
    });
    if (!res.data || !res.data.uploadBio) {
      dispatch(
        showMessage({
          success: false,
          message: "Something went wrong. Please contact support.",
        })
      );
      return false;
    }
    dispatch({
      type: SET_BIO,
      payload: { ...res.data.uploadBio },
    });
    return true;
  } catch (err) {
    console.log(err);
  }
};
export const getUserPosts = (userId, skipMult) => async (dispatch) => {
  try {
    let fetchPolicy = "no-cache";
    const res = await client.query({
      query: GET_USER_POSTS_QUERY,
      variables: {
        userId,
        skipMult,
      },
      fetchPolicy,
    });
    if (!res.data || !res.data.getUserPosts) {
      dispatch(
        showMessage({
          success: false,
          message: "Something went wrong. Please contact support.",
        })
      );
      return false;
    }
    dispatch({
      type: SET_POSTS,
      payload: res.data.getUserPosts,
    });
    return res.data.getUserPosts;
  } catch (err) {
    console.log(err);
  }
};
