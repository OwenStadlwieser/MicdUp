import { client } from "../../apollo/client/index";
import { GET_TAGS_QUERY } from "../../apollo/private/tag";
import { SET_USER, LOG_IN } from "../types";

export const searchTags = (searchTerm) => async (dispatch) => {
  try {
    const res = await client.query({
      query: GET_TAGS_QUERY,
      variables: { searchTerm },
      fetchPolicy: "no-cache",
    });
    return res.data.searchTags;
  } catch (err) {
    console.log(err);
  }
};
