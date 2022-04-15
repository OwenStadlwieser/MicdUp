import { publicClient } from "../../apollo/client/index";
import {
  GET_TAGS_QUERY,
  GET_RANDOM_PROMPT_QUERY,
  GET_POPULAR_TAGS_QUERY,
  GET_RECOMMENDED_TAGS,
} from "../../apollo/private/tag";
import { SET_USER, LOG_IN } from "../types";

export const getPopularTags = () => async (dispatch) => {
  try {
    const res = await publicClient.query({
      query: GET_POPULAR_TAGS_QUERY,
      variables: {},
      fetchPolicy: "no-cache",
    });
    return res.data.getPopularTags;
  } catch (err) {
    console.log(err);
  }
};
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

export const getRecommendedTags = () => async (dispatch) => {
  try {
    const res = await publicClient.query({
      query: GET_RECOMMENDED_TAGS,
      fetchPolicy: "no-cache",
    });
    return res.data.getRecommendedTags;
  } catch (err) {
    console.log(err);
  }
};
