import {
  SHOW_MORE_REPLIES,
  DELETE_COMMENT_MUTATION,
  LIKE_COMMENT_MUTATION,
} from "../../apollo/private/comment";
import {
  UPDATE_POST_COMMENTS,
  UPDATE_COMMENT_TO_POST,
  DELETE_COMMENT,
  ALTER_COMMENTS,
} from "../types";
import { showMessage } from "./display";
import { publicClient, privateClient } from "../../apollo/client";
export const getReplies = (commentId) => async (dispatch) => {
  try {
    let fetchPolicy = "no-cache";
    const res = await publicClient.query({
      query: SHOW_MORE_REPLIES(3),
      variables: {
        commentId,
      },
      fetchPolicy,
    });
    if (!res.data || !res.data.getReplies) {
      dispatch(
        showMessage({
          success: false,
          message: "Something went wrong. Please contact support.",
        })
      );
      return false;
    }
    return res.data.getReplies;
  } catch (err) {
    console.log(err);
  }
};

export const updateCommentDisplay =
  (comment, parents, postId) => async (dispatch) => {
    try {
      dispatch({
        type: UPDATE_COMMENT_TO_POST,
        payload: { comment, parents, postId },
      });
    } catch (err) {
      console.log(err);
    }
  };

export const likeComment = (commentId) => async (dispatch) => {
  try {
    let fetchPolicy = "no-cache";
    const res = await privateClient.mutate({
      mutation: LIKE_COMMENT_MUTATION(3),
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
    return res.data.likeComment;
  } catch (err) {
    console.log(err);
  }
};

export const deleteComment = (commentId) => async (dispatch) => {
  try {
    let fetchPolicy = "no-cache";
    const res = await privateClient.mutate({
      mutation: DELETE_COMMENT_MUTATION(3),
      variables: {
        commentId,
      },
      fetchPolicy,
    });
    if (!res.data || !res.data.deleteComment) {
      dispatch(
        showMessage({
          success: false,
          message: "Something went wrong. Please contact support.",
        })
      );
      return false;
    }
    return res.data.deleteComment;
  } catch (err) {
    console.log(err);
  }
};

export const updateComments = (payload) => (dispatch) => {
  dispatch({
    type: ALTER_COMMENTS,
    payload,
  });
};
