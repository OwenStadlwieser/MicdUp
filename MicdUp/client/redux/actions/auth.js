import { client } from "../../apollo/client/index";
import {
  SIGNUP_MUTATION,
  LOGIN_QUERY,
  FORGOT_PASS_MUTATION,
  FORGOT_PASS_CHANGE_MUTATION,
  FORGOT_PASS_VERIFY_QUERY,
} from "../../apollo/public/auth";
import { LOG_IN, LOG_OUT, DISPLAY_MESSAGE, SET_SOCKET } from "../types";
import { storeData, clearAsyncStorage } from "../../reuseableFunctions/helpers";
import { showMessage } from "./display";

export const setSocket = (socket) => async (dispatch) => {
  try {
    dispatch({
      type: SET_SOCKET,
      payload: socket,
    });
  } catch (err) {
    console.log(err);
  }
};
export const login = (authenticator, password) => async (dispatch) => {
  try {
    const res = await client.query({
      query: LOGIN_QUERY,
      variables: { authenticator, password },
      fetchPolicy: "no-cache",
    });
    if (res.data.login.success) {
      await storeData("token", res.data.login.message);
      dispatch({ type: LOG_IN });
    }
    if (res && res.data && !res.data.login.success) {
      dispatch(showMessage(res.data.login));
    }
    return res.data.login;
  } catch (err) {
    console.log(err);
  }
};

export const logout = () => async (dispatch) => {
  await clearAsyncStorage();
  dispatch({ type: LOG_OUT });
};

export const forgotPass = (email) => async (dispatch) => {
  try {
    const res = await client.mutate({
      mutation: FORGOT_PASS_MUTATION,
      variables: { email },
      fetchPolicy: "no-cache",
    });
    if (res && res.data) {
      dispatch(showMessage(res.data.forgotPass));
    }
    return res;
  } catch (err) {
    console.log(err);
  }
};

export const forgotPassVerify = (secureCode, email) => async (dispatch) => {
  try {
    console.log(email);
    const res = await client.query({
      query: FORGOT_PASS_VERIFY_QUERY,
      variables: { secureCode, email },
      fetchPolicy: "no-cache",
    });
    if (res && res.data) dispatch(showMessage(res.data.forgotPassVerify));
    return res;
  } catch (err) {
    console.log(err);
  }
};

export const forgotPassChange =
  (secureCode, newPass, email) => async (dispatch) => {
    try {
      const res = await client.mutate({
        mutation: FORGOT_PASS_CHANGE_MUTATION,
        variables: { secureCode, newPass, email },
        fetchPolicy: "no-cache",
      });
      if (res && res.data) dispatch(showMessage(res.data.forgotPassChange));
      return res;
    } catch (err) {
      console.log(err);
    }
  };

export const register =
  (email, phone, password, user, dob) => async (dispatch) => {
    try {
      const res = await client.mutate({
        mutation: SIGNUP_MUTATION,
        variables: { email, phone, password, user, dob },
        fetchPolicy: "no-cache",
      });
      return res;
    } catch (err) {
      console.log(err);
    }
  };
