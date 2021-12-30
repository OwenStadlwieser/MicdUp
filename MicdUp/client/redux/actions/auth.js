import { client } from "../../apollo/client/index";
import { SIGNUP_MUTATION, LOGIN_QUERY } from "../../apollo/public/auth";
import { LOG_IN, LOG_OUT } from "../types";
import { storeData, clearAsyncStorage } from "../../reuseableFunctions/helpers";
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
    return res.data.login;
  } catch (err) {
    console.log(err);
  }
};

export const logout = () => async (dispatch) => {
  await clearAsyncStorage();
  dispatch({ type: LOG_OUT });
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
