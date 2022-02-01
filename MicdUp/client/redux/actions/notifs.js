import {
    GET_NOTIFS
} from "../types";

import { SHOW_MORE_NOTIFS } from "../../apollo/private/notifs";

export const getNotifs = async (payload) => {
    try {
        let fetchPolicy = "no-cache";
        const res = await client.query({
          query: SHOW_MORE_NOTIFS(3),
          variables: {
            userId,
          },
          fetchPolicy,
        });
        if (!res.data || !res.data.getNotifs) {
          dispatch(
            showMessage({
              success: false,
              message: "Something went wrong. Please contact support.",
            })
          );
          return false;
        }
        return res.data.getNotifs;
      } catch (err) {
        console.log(err);
      }
}