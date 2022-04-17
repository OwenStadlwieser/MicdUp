import {
  GET_FOLLOWING_FEED,
  GET_NOT_LOGGED_IN_FEED,
  GET_TOPICS_FEED,
} from "../../apollo/private/feed";
import { privateClient, publicClient } from "../../apollo/client/index";
import {
  SET_FOLLOWING_FEED,
  APPEND_FOLLOWING_FEED,
  SET_NOT_LOGGED_IN_FEED,
  APPEND_NOT_LOGGED_IN_FEED,
  SET_TOPICS_FEED,
  APPEND_TOPICS_FEED,
} from "../types";
import { showMessage } from "./display";

export const getFollowingFeed = (skipMult) => async (dispatch) => {
  try {
    const res = await privateClient.query({
      query: GET_FOLLOWING_FEED,
      variables: { skipMult },
      fetchPolicy: "no-cache",
    });
    if (!res || !res.data || !res.data.getFollowingFeed) {
      dispatch(
        showMessage({ success: false, message: "Fetching feed failed" })
      );
    }
    if (skipMult == 0 && res.data.getFollowingFeed) {
      dispatch({
        type: SET_FOLLOWING_FEED,
        payload: res.data.getFollowingFeed,
      });
    } else if (res.data.getFollowingFeed) {
      dispatch({
        type: APPEND_FOLLOWING_FEED,
        payload: res.data.getFollowingFeed,
      });
    }
    return res.data.getFollowingFeed;
  } catch (err) {
    console.log(err);
  }
};

export const getTopicsFeed = (skipMult) => async (dispatch) => {
  try {
    const res = await privateClient.query({
      query: GET_TOPICS_FEED,
      variables: { skipMult },
      fetchPolicy: "no-cache",
    });
    if (!res || !res.data || !res.data.getFollowingTopicsFeed) {
      dispatch(
        showMessage({ success: false, message: "Fetching feed failed" })
      );
    }
    if (skipMult == 0 && res.data.getFollowingTopicsFeed) {
      dispatch({
        type: SET_TOPICS_FEED,
        payload: res.data.getFollowingTopicsFeed,
      });
    } else if (res.data.getFollowingTopicsFeed) {
      dispatch({
        type: APPEND_TOPICS_FEED,
        payload: res.data.getFollowingTopicsFeed,
      });
    }
    return res.data.getTopicsgetFollowingTopicsFeedFeed;
  } catch (err) {
    console.log(err);
  }
};

export const getNotLoggedInFeed = (skipMult) => async (dispatch) => {
  try {
    const res = await publicClient.query({
      query: GET_NOT_LOGGED_IN_FEED,
      variables: { skipMult },
      fetchPolicy: "no-cache",
    });
    if (!res || !res.data || !res.data.getNotLoggedInFeed) {
      dispatch(
        showMessage({ success: false, message: "Fetching feed failed" })
      );
    }
    if (skipMult == 0 && res.data.getNotLoggedInFeed) {
      dispatch({
        type: SET_NOT_LOGGED_IN_FEED,
        payload: res.data.getNotLoggedInFeed,
      });
    } else if (res.data.getNotLoggedInFeed) {
      dispatch({
        type: APPEND_NOT_LOGGED_IN_FEED,
        payload: res.data.getNotLoggedInFeed,
      });
    }
    return res.data.getNotLoggedInFeed;
  } catch (err) {
    console.log(err);
  }
};
