import { gql } from "@apollo/client";
import { duplicateCommentsString } from "../../reuseableFunctions/helpers";
import { commentType } from "./types";
const SHOW_MORE_REPLIES = (duplication) => {
  return gql`
      query getReplies(
        $commentId: ID!
      ) {
        getReplies(
          commentId: $commentId
        ) {
          ${commentType}
          ${duplicateCommentsString(duplication)}
        }
      }
    `;
};

const DELETE_COMMENT_MUTATION = (duplication) => {
  return gql`
      mutation deleteComment(
        $commentId: ID!
      ) {
        deleteComment(
          commentId: $commentId
        ) {
          ${commentType}
          ${duplicateCommentsString(duplication)}
        }
      }
    `;
};

const LIKE_COMMENT_MUTATION = (duplication) => {
  return gql`
      mutation likeComment(
        $commentId: ID!
      ) {
        likeComment(
          commentId: $commentId
        ) {
          ${commentType}
          ${duplicateCommentsString(duplication)}
        }
      }
    `;
};

export { SHOW_MORE_REPLIES, DELETE_COMMENT_MUTATION, LIKE_COMMENT_MUTATION };
