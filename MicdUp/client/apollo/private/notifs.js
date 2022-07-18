import { gql } from "@apollo/client";
import { notifType } from "./types";
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

export const GET_USER_NOTIF_QUERY = () => {
  return gql`
    query getUserNotifs($skipMult: Int!) {
      getUserNotifs(skipMult: $skipMult) {
        notifs {
          ${notifType}
        }
        numberOfUnseenNotifs
      }
    }
  `;
};

export const MARK_NOTIFS_AS_SEEN_MUTATION = () => {
  gql`
    mutation markNotifsAsSeen() {
      markNotifsAsSeen() {
        success
        message
      }
    }
  `;
};
