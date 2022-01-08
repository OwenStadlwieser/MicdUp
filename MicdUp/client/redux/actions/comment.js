import { SHOW_MORE_REPLIES } from "../../apollo/private/comment";
import {
  UPDATE_POST_COMMENT,
  UPDATE_POST_COMMENTS,
  UPDATE_POST_COMMENT2,
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
