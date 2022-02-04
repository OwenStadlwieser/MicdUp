import {
    GET_NOTIFS
} from "../types";

import { client } from "../../apollo/client";

import { NOTIF_TOKEN_MUTATION } from "../../apollo/private/notifs";

export const addToken = async (token) => {
    try {
        let fetchPolicy = "no-cache";
        const res = await client.mutate({
          mutation: NOTIF_TOKEN_MUTATION(),
          variables: {
            token,
          },
          fetchPolicy,
        });
        if (!res.data) {
          dispatch(
            showMessage({
              success: false,
              message: "Something went wrong. Please contact support.",
            })
          );
          return false;
        }
        return res.data.success;
      } catch (err) {
        console.log(err);
      }
}