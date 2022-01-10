import {
  ALTER_CLIPS,
  UPDATE_TITLE,
  UPDATE_TAGS,
  ALTER_POSTS,
  CLEAR_RECORDING,
  NAVIGATE,
  SET_BIO,
  SET_POSTS,
  UPDATE_POST,
  UPDATE_COMMENT_TO_POST,
  UPDATE_POST_COMMENTS,
  DELETE_POST,
  UPDATE_COMMENT,
} from "../types";
import {
  UPLOAD_RECORDING_MUTATION,
  UPLOAD_BIO_MUTATION,
  GET_USER_POSTS_QUERY,
  LIKE_POST_MUTATION,
  LIKE_COMMENT_MUTATION,
  DELETE_POST_MUTATION,
  COMMENT_POST_MUTATION,
  GET_COMMENT_POST_QUERY,
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

export const updatePosts = (payload) => (dispatch) => {
  dispatch({
    type: ALTER_POSTS,
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

export const likePost = (postId) => async (dispatch) => {
  try {
    let fetchPolicy = "no-cache";
    const res = await client.mutate({
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

export const likeComment = (commentId) => async (dispatch) => {
  try {
    let fetchPolicy = "no-cache";
    const res = await client.mutate({
      mutation: LIKE_COMMENT_MUTATION,
      variables: {
        commentId,
      },
      fetchPolicy,
    });
    if (!res.data || !res.data.likeComment) {
      dispatch(
        showMessage({
          success: false,
          message: "Something went wrong. Please contact support.",
        })
      );
      return false;
    }
    dispatch({
      type: UPDATE_COMMENT,
      payload: res.data.likeComment,
    });
    return res.data.likeComment;
  } catch (err) {
    console.log(err);
  }
};

export const deletePost = (postId) => async (dispatch) => {
  try {
    let fetchPolicy = "no-cache";
    const res = await client.mutate({
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
    if (res && res.data) {
      dispatch({
        type: DELETE_POST,
        payload: res.data.deletePost,
      });
    }
    console.log("actions/recording deletePost end");
    return res.data.deletePost;
  } catch (err) {
    console.log(err);
  }
};

export const getComments =
  (postId, skipMult = 0) =>
  async (dispatch) => {
    try {
      let fetchPolicy = "no-cache";
      const res = await client.query({
        query: GET_COMMENT_POST_QUERY,
        variables: {
          postId,
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
        payload: { data: res.data.getComments, id: postId },
      });
      return res.data.getComments;
    } catch (err) {
      console.log(err);
    }
  };
export const commentPost =
  (postId, replyingTo, files, fileTypes, text, parents) => async (dispatch) => {
    try {
      let fetchPolicy = "no-cache";
      const res = await client.mutate({
        mutation: COMMENT_POST_MUTATION(3),
        variables: {
          postId,
          replyingTo,
          files,
          fileTypes,
          text,
        },
        fetchPolicy,
      });
      console.log(res);
      if (!res.data || !res.data.commentToPost) {
        dispatch(
          showMessage({
            success: false,
            message: "Something went wrong. Please contact support.",
          })
        );
        return false;
      }
      dispatch({
        type: UPDATE_COMMENT_TO_POST,
        payload: { comment: res.data.commentToPost, parents, postId },
      });
      return res.data.commentToPost;
    } catch (err) {
      console.log(err);
    }
  };
