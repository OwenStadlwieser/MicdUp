import { client } from "../../apollo/client/index";
import {
  GET_USER_QUERY,
  DELETE_ACCOUNT_MUTATION,
} from "../../apollo/private/user";
import { SET_USER, LOG_IN, DELETE_ACCOUNT } from "../types";

export const getUserQuery = () => async (dispatch) => {
  try {
    const res = await client.query({
      query: GET_USER_QUERY,
    });
    if (res && res.data) {
      dispatch({
        type: SET_USER,
        payload: res.data.getUser,
      });
      if (res.data.getUser && res.data.getUser.id) {
        dispatch({
          type: LOG_IN,
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
    const res = await client.mutate({
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
