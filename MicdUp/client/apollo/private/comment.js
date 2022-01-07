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

export { SHOW_MORE_REPLIES };
