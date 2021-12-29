import { client } from "../../apollo/client/index";
import { SIGNUP_MUTATION, LOGIN_QUERY } from "../../apollo/public/auth";
import { LOG_IN } from "../types";

export const login = (email, password) => async (dispatch) => {
  try {
    const res = await client.query({
      query: LOGIN_QUERY,
      variables: { email, password },
    });
    if (res.data.login.token) dispatch({ type: LOG_IN });
    return res.data.login;
  } catch (err) {
    console.log(err);
  }
};

export const register =
  (email, phone, password, user, dob) => async (dispatch) => {
    console.log(email, phone, password, user, dob);
    try {
      const res = await client.mutate({
        mutation: SIGNUP_MUTATION,
        variables: { email, phone, password, user, dob },
      });
      return res;
    } catch (err) {
      console.log(err);
    }
  };
