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
  DELETE_TAG,
  SET_SINGLE_POST,
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
  GET_SPECIFIC_POST_QUERY,
} from "../../apollo/private/recording";
import { publicClient, privateClient } from "../../apollo/client";
import store from "../index";
import { SHOW_MORE_REPLIES } from "../../apollo/private/comment";
import { rollbar } from "../../reuseableFunctions/constants";
import { navigate, showMessage } from "./display";

export function checkIfLoggedIn() {
  let { loggedIn } = store.getState().auth;
  if (loggedIn) {
    return true;
  } else {
    return false;
  }
}
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

export const deleteTag = (payload) => (dispatch) => {
  dispatch({
    type: DELETE_TAG,
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
    payload: {
      userId: payload,
    },
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
      if (!checkIfLoggedIn()) {
        dispatch(
          showMessage({
            success: false,
            message: "Create an account and login to access this feature",
          })
        );
        return;
      }
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
      dispatch(navigate("Feed"));
      dispatch(
        showMessage({ success: true, message: "Your post has been uploaded" })
      );
    } catch (err) {
      rollbar.log(err);
    }
  };

export const openSpecificPost = (postId, commentId) => async (dispatch) => {
  try {
    const res = await privateClient.query({
      query: GET_SPECIFIC_POST_QUERY,
      variables: {
        postId,
      },
      fetchPolicy: "no-cache",
    });
    const post = res.data.getSpecificPost;
    console.log(commentId, 1234345);
    if (commentId) {
      const commentChain = await publicClient.query({
        query: SHOW_MORE_REPLIES(5),
        variables: {
          commentId,
        },
      });
      console.log(commentChain, 12324334);
      post.comments = [commentChain.data.getReplies];
    }
    dispatch({
      type: SET_SINGLE_POST,
      payload: post,
    });
  } catch (err) {
    rollbar.log(err);
  }
};
export const uploadBio =
  (files, fileTypes, speechToText) => async (dispatch) => {
    try {
      if (!checkIfLoggedIn()) {
        dispatch(
          showMessage({
            success: false,
            message: "Create an account and login to access this feature",
          })
        );
        return;
      }
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
      rollbar.log(err);
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
    if (skipMult == 0) {
      dispatch({
        type: CLEAR_POSTS,
        payload: {
          userId,
        },
      });
    }
    dispatch({
      type: SET_POSTS,
      payload: { posts: res.data.getUserPosts.filter((el) => el), userId },
    });
    return res.data.getUserPosts;
  } catch (err) {
    rollbar.log(err);
  }
};

export const likePost = (postId, currentKey) => async (dispatch) => {
  try {
    if (!checkIfLoggedIn()) {
      dispatch(
        showMessage({
          success: false,
          message: "Create an account and login to access this feature",
        })
      );
      return;
    }
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
      payload: { post: res.data.likePost, currentKey },
    });
    return res.data.likePost;
  } catch (err) {
    rollbar.log(err);
  }
};

export const deletePost = (postId, currentKey) => async (dispatch) => {
  try {
    if (!checkIfLoggedIn()) {
      dispatch(
        showMessage({
          success: false,
          message: "Create an account and login to access this feature",
        })
      );
      return;
    }
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
        payload: { id: postId, currentKey },
      });
      dispatch(
        showMessage({
          success: true,
          message: "Post deleted",
        })
      );
    }
    return res.data.deletePost;
  } catch (err) {
    console.log(err);
    rollbar.log(err);
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
      rollbar.log(err);
    }
  };
export const commentPost =
  (post, replyingTo, files, fileTypes, text, speechToText, parents) =>
  async (dispatch) => {
    try {
      if (!checkIfLoggedIn()) {
        dispatch(
          showMessage({
            success: false,
            message: "Create an account and login to access this feature",
          })
        );
        return;
      }
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
      rollbar.log(err);
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
          payload: {
            userId: searchTag,
          },
        });
      }
      dispatch({
        type: SET_POSTS,
        payload: {
          posts: res.data.getRecordingsFromTag.filter((el) => el),
          userId: searchTag,
        },
      });
      return res.data.getRecordingsFromTag;
    } catch (err) {
      rollbar.log(err);
    }
  };
