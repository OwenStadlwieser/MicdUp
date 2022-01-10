import { SHOW_MORE_REPLIES, DELETE_COMMENT_MUTATION } from "../../apollo/private/comment";
import {
  UPDATE_POST_COMMENT,
  UPDATE_POST_COMMENTS,
  UPDATE_POST_COMMENT2,
  DELETE_COMMENT,
  ALTER_COMMENTS,
} from "../types";
import { client } from "../../apollo/client";
export const getReplies = (commentId) => async (dispatch) => {
  try {
    let fetchPolicy = "no-cache";
    const res = await client.query({
      query: SHOW_MORE_REPLIES(3),
      variables: {
        commentId,
      },
      fetchPolicy,
    });
    console.log(res);
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
        type: UPDATE_POST_COMMENT2,
        payload: { comment, parents, postId },
      });
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
  
  export const deleteComment = (commentId) => async (dispatch) => {
    try {
      let fetchPolicy = "no-cache";
      const res = await client.mutate({
        mutation: DELETE_COMMENT_MUTATION,
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
      if (res && res.data) {
        dispatch({
          type: DELETE_COMMENT,
          payload: res.data.deletePost,
        });
      }
      console.log("Deleted comment")
      return res.data.deleteComment;
    } catch (err) {
      console.log(err);
    }
  }

  export const updateComments = (payload) => (dispatch) => {
    dispatch({
      type: ALTER_COMMENTS,
      payload,
    });
  };
