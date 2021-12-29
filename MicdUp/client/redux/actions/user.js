import { client } from "../../apollo/client/index";
import { GET_USER_QUERY } from "../../apollo/private/user";
import { SET_USER } from "../types";

export const getUserQuery = () => async (dispatch) => {
  try {
    const res = await client.query({
      query: GET_USER_QUERY,
    });
    dispatch({
      type: SET_USER,
      payload: res.data.getUser,
    });
    return res.data.getUser;
  } catch (err) {
    console.log(err);
  }
};
