import { client } from "../../apollo/client/index";
import { GET_USER_QUERY } from "../../apollo/private/user";
import { SET_USER, LOG_IN } from "../types";

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
