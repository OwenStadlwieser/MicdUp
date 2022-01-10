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
          signedUrl
          text
          likes
          isLikedByUser
          repliesLength
          owner {
            id
            user {
              id
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

const DELETE_COMMENT_MUTATION = gql`
  mutation deleteComment($commentId: ID!) {
    deleteComment(commentId: $commentId) {
      success
      message
    }
  }
`;

export { SHOW_MORE_REPLIES, DELETE_COMMENT_MUTATION };
