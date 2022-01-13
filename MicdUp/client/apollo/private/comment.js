import { gql } from "@apollo/client";
import { duplicateCommentsString } from "../../reuseableFunctions/helpers";

const SHOW_MORE_REPLIES = (duplication) => {
  return gql`
      query getReplies(
        $commentId: ID!
      ) {
        getReplies(
          commentId: $commentId
        ) {
          id
          ultimateParent
          isDeleted
          signedUrl
          text
          likes
          isLikedByUser
          repliesLength
          owner {
            id
            user {
              _id
              userName
            }
            image {
              id
              signedUrl
            }
          }
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
          id
          ultimateParent
          isDeleted
          signedUrl
          text
          likes
          isLikedByUser
          repliesLength
          owner {
            id
            user {
              _id
              userName
            }
            image {
              id
              signedUrl
            }
          }
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
          id
          ultimateParent
          isDeleted
          signedUrl
          text
          likes
          isLikedByUser
          repliesLength
          owner {
            id
            user {
              _id
              userName
            }
            image {
              id
              signedUrl
            }
          }
          ${duplicateCommentsString(duplication)}
        }
      }
    `;
};

export { SHOW_MORE_REPLIES, DELETE_COMMENT_MUTATION, LIKE_COMMENT_MUTATION };
