import { gql } from "@apollo/client";
import { duplicateNotifsString } from "../../reuseableFunctions/helpers";

export const NOTIF_TOKEN_MUTATION = () => {
    return gql`
    mutation addToken($token: String!) {
      addToken(token: $token) {
        success
        message
      }
    }
      `;
  };