import { privateClient } from "../../apollo/client";

import {
  NOTIF_TOKEN_MUTATION,
  MARK_NOTIFS_AS_SEEN_MUTATION,
  GET_USER_NOTIF_QUERY,
} from "../../apollo/private/notifs";
import { SET_NOTIFS, APPEND_NOTIFS, UPDATE_NOTIFS_UNSEEN } from "../types";
import { showMessage } from "./display";
import { rollbar } from "../../reuseableFunctions/constants";

export const addToken = (token) => async (dispatch) => {
  try {
    let fetchPolicy = "no-cache";
    const res = await privateClient.mutate({
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
    rollbar.log(err);
  }
};

export const getUserNotifs = (skipMult) => async (dispatch) => {
  try {
    console.log("fetching notifications");
    let fetchPolicy = "no-cache";
    const res = await privateClient.query({
      query: GET_USER_NOTIF_QUERY(),
      variables: {
        skipMult,
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
    if (skipMult == 0) {
      dispatch({
        type: SET_NOTIFS,
        payload: res.data.getUserNotifs.notifs,
      });
    } else {
      dispatch({
        type: APPEND_NOTIFS,
        payload: res.data.getUserNotifs.notifs,
      });
    }
    dispatch({
      type: UPDATE_NOTIFS_UNSEEN,
      payload: res.data.getUserNotifs.numberOfUnseenNotifs,
    });
    dispatch(updateNotifsAsSeen());
    return res.data.getUserNotifs;
  } catch (err) {
    rollbar.log(err);
  }
};

const updateNotifsAsSeen = () => async (dispatch) => {
  let fetchPolicy = "no-cache";

  await privateClient.mutate({
    mutation: MARK_NOTIFS_AS_SEEN_MUTATION,
    variables: {},
    fetchPolicy,
  });
};

export const markNotifsAsSeen = () => async (dispatch) => {
  try {
    dispatch({
      type: UPDATE_NOTIFS_UNSEEN,
      payload: 0,
    });
  } catch (err) {
    rollbar.log(err);
  }
};
