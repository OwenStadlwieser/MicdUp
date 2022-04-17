import {
  ALTER_CLIPS,
  UPDATE_TITLE,
  UPDATE_TAGS,
  CLEAR_RECORDING,
  NAVIGATE,
  SET_BIO,
  SET_POSTS,
  UPDATE_POST,
  UPDATE_COMMENT_TO_POST,
  UPDATE_POST_COMMENTS,
  DELETE_POST,
  CLEAR_POSTS,
  UPDATE_CURRENT_RECORDINGS,
} from "../types";
import {
  UPLOAD_RECORDING_MUTATION,
  UPLOAD_BIO_MUTATION,
  GET_USER_POSTS_QUERY,
  LIKE_POST_MUTATION,
  DELETE_POST_MUTATION,
  COMMENT_POST_MUTATION,
  GET_COMMENT_POST_QUERY,
  GET_RECORDINGS_FROM_TAG_QUERY,
  ADD_LISTENER_LOGGED_IN_MUTATION,
  ADD_LISTENER_NOT_LOGGED_IN_MUTATION,
} from "../../apollo/private/recording";
import { ADD_LISTENER_MUTATION } from "../../apollo/private/recording";
import { publicClient, privateClient } from "../../apollo/client";
import { showMessage } from "./display";
import store from "../index";

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

export const clearPosts = (payload) => (dispatch) => {
  dispatch({
    type: CLEAR_POSTS,
    payload,
  });
};
export const addListener = (postId, ipAddr, listenTime) => async (dispatch) => {
  const res = await publicClient.mutate({
    mutation: ADD_LISTENER_NOT_LOGGED_IN_MUTATION,
    variables: {
      postId,
      ipAddr,
      listenTime,
    },
  });
};

export const addListenerAuthenticated =
  (postId, listenTime) => async (dispatch) => {
    const res = await privateClient.mutate({
      mutation: ADD_LISTENER_LOGGED_IN_MUTATION,
      variables: {
        postId,
        listenTime,
      },
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
    privatePost,
    speechToText
  ) =>
  async (dispatch) => {
    try {
      const res = await privateClient.mutate({
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
          speechToText,
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

export const uploadBio =
  (files, fileTypes, speechToText) => async (dispatch) => {
    try {
      const res = await privateClient.mutate({
        mutation: UPLOAD_BIO_MUTATION,
        variables: {
          files,
          fileTypes,
          speechToText,
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
    const res = await publicClient.query({
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
      payload: { posts: res.data.getUserPosts, userId },
    });
    return res.data.getUserPosts;
  } catch (err) {
    console.log(err);
  }
};

export const likePost = (postId) => async (dispatch) => {
  try {
    let fetchPolicy = "no-cache";
    const res = await privateClient.mutate({
      mutation: LIKE_POST_MUTATION,
      variables: {
        postId,
      },
      fetchPolicy,
    });
    if (!res.data || !res.data.likePost) {
      dispatch(
        showMessage({
          success: false,
          message: "Something went wrong. Please contact support.",
        })
      );
      return false;
    }
    dispatch({
      type: UPDATE_POST,
      payload: res.data.likePost,
    });
    return res.data.likePost;
  } catch (err) {
    console.log(err);
  }
};

export const deletePost = (postId) => async (dispatch) => {
  try {
    let fetchPolicy = "no-cache";
    const res = await privateClient.mutate({
      mutation: DELETE_POST_MUTATION,
      variables: {
        postId,
      },
      fetchPolicy,
    });
    if (!res.data || !res.data.deletePost) {
      dispatch(
        showMessage({
          success: false,
          message: "Something went wrong. Please contact support.",
        })
      );
      return false;
    }
    if (res && res.data && res.data.deletePost && res.data.deletePost.success) {
      dispatch({
        type: DELETE_POST,
        payload: { id: postId },
      });
    }
    return res.data.deletePost;
  } catch (err) {
    console.log(err);
  }
};

export const getComments =
  (post, skipMult = 0) =>
  async (dispatch) => {
    try {
      let fetchPolicy = "no-cache";
      const res = await publicClient.query({
        query: GET_COMMENT_POST_QUERY,
        variables: {
          postId: post.id,
          skipMult,
        },
        fetchPolicy,
      });
      if (!res.data || !res.data.getComments) {
        dispatch(
          showMessage({
            success: false,
            message: "Something went wrong. Please contact support.",
          })
        );
        return false;
      }
      dispatch({
        type: UPDATE_POST_COMMENTS,
        payload: {
          data: res.data.getComments,
          id: post.id,
          owner: post.owner.id,
        },
      });
      return res.data.getComments;
    } catch (err) {
      console.log(err);
    }
  };
export const commentPost =
  (post, replyingTo, files, fileTypes, text, speechToText, parents) =>
  async (dispatch) => {
    try {
      let fetchPolicy = "no-cache";
      const res = await privateClient.mutate({
        mutation: COMMENT_POST_MUTATION(3),
        variables: {
          postId: post.id,
          replyingTo,
          files,
          fileTypes,
          text,
          speechToText,
        },
        fetchPolicy,
      });
      if (!res.data || !res.data.commentToPost) {
        dispatch(
          showMessage({
            success: false,
            message: "Something went wrong. Please contact support.",
          })
        );
        return false;
      }
      console.log("commented");
      dispatch({
        type: UPDATE_COMMENT_TO_POST,
        payload: {
          comment: res.data.commentToPost,
          parents,
          owner: post.owner.id,
          postId: post.id,
        },
      });
      return res.data.commentToPost;
    } catch (err) {
      console.log(err);
    }
  };

export const getRecordingsFromTag =
  (searchTag, skipMult = 0) =>
  async (dispatch) => {
    try {
      let fetchPolicy = "no-cache";
      const res = await publicClient.query({
        query: GET_RECORDINGS_FROM_TAG_QUERY,
        variables: {
          searchTag,
          skipMult,
        },
        fetchPolicy,
      });
      if (!res.data || !res.data.getRecordingsFromTag) {
        dispatch(
          showMessage({
            success: false,
            message: "Something went wrong. Please contact support.",
          })
        );
        return false;
      }
      if (skipMult == 0) {
        dispatch({
          type: CLEAR_POSTS,
        });
      }
      dispatch({
        type: SET_POSTS,
        payload: {
          posts: res.data.getRecordingsFromTag,
          userId: searchTag,
        },
      });
      return res.data.getRecordingsFromTag;
    } catch (err) {
      console.log(err);
    }
  };
