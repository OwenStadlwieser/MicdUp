import { gql } from "@apollo/client";
import { duplicateNotifsString } from "../../reuseableFunctions/helpers";

export const SHOW_MORE_NOTIFS = (duplication) => {
    return gql`
        query getNotifs(
          $userId: ID!
        ) {
          getNotifs(
            userId: $userId
          ) {
            id
            ultimateParent
            signedUrl
            text
            notifsLength
            navTo
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
            ${duplicateNotifsString(duplication)}
          }
        }
      `;
  };