import { privateClient, publicClient } from "../../apollo/client/index";
import {
  GET_USER_QUERY,
  DELETE_ACCOUNT_MUTATION,
  VERIFY_EMAIL_MUTATION,
  SET_EMAIL_VERIFIED_MUTATION,
  SEARCH_USERS_QUERY,
} from "../../apollo/private/user";
import { SET_USER, LOG_IN, DELETE_ACCOUNT, VIEW_PROFILE } from "../types";
import { showMessage } from "./display";

export const getUserQuery = () => async (dispatch) => {
  try {
    const res = await privateClient.query({
      query: GET_USER_QUERY,
      fetchPolicy: "no-cache",
    });
    if (res && res.data) {
      dispatch({
        type: SET_USER,
        payload: res.data.getUser,
      });
      if (res.data.getUser && res.data.getUser._id) {
        dispatch({
          type: LOG_IN,
        });
        dispatch({
          type: VIEW_PROFILE,
          payload: res.data.getUser.profile,
        });
      }
    }
    return res.data.getUser;
  } catch (err) {
    console.log(err);
  }
};

export const deleteAccount = () => async (dispatch) => {
  try {
    const res = await privateClient.mutate({
      mutation: DELETE_ACCOUNT_MUTATION,
      fetchPolicy: "no-cache",
    });
    if (res && res.data) {
      dispatch({
        type: DELETE_ACCOUNT,
        payload: res.data.deleteAccount,
      });
    }
    return res.data.deleteAccount;
  } catch (err) {
    console.log(err);
  }
};

export const verifyEmail = (email) => async (dispatch) => {
  try {
    const res = await privateClient.mutate({
      mutation: VERIFY_EMAIL_MUTATION,
      variables: { email },
      fetchPolicy: "no-cache",
    });
    if (res && res.data) {
      dispatch(showMessage(res.data.verifyEmail));
    }
    return res;
  } catch (err) {
    console.log(err);
  }
};

export const setEmailVerified =
  (verificationCode, email) => async (dispatch) => {
    try {
      const res = await privateClient.mutate({
        mutation: SET_EMAIL_VERIFIED_MUTATION,
        variables: { verificationCode, email },
        fetchPolicy: "no-cache",
      });
      if (res && res.data) dispatch(showMessage(res.data.setEmailVerified));
      return res;
    } catch (err) {
      console.log(err);
    }
  };

export const searchUsers = (searchTerm, skipMult) => async (dispatch) => {
  try {
    const res = await publicClient.query({
      query: SEARCH_USERS_QUERY,
      variables: { searchTerm, skipMult },
      fetchPolicy: "no-cache",
    });
    if (!res || !res.data)
      dispatch(showMessage({ success: false, message: "Connection failed" }));
    return res.data.searchUsers;
  } catch (err) {
    console.log(err);
  }
};
