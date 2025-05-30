import { publicClient } from "../../apollo/client/index";
import {
  GET_TAGS_QUERY,
  GET_RANDOM_PROMPT_QUERY,
} from "../../apollo/private/tag";
import { SET_USER, LOG_IN } from "../types";

export const searchTags = (searchTerm) => async (dispatch) => {
  try {
    const res = await publicClient.query({
      query: GET_TAGS_QUERY,
      variables: { searchTerm },
      fetchPolicy: "no-cache",
    });
    return res.data.searchTags;
  } catch (err) {
    console.log(err);
  }
};

export const randomPrompt = () => async (dispatch) => {
  try {
    const res = await publicClient.query({
      query: GET_RANDOM_PROMPT_QUERY,
      fetchPolicy: "no-cache",
    });
    return res.data.randomPrompt;
  } catch (err) {
    console.log(err);
  }
};
