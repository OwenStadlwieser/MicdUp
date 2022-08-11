import {
  GET_FOLLOWING_FEED,
  GET_NOT_LOGGED_IN_FEED,
  GET_TOPICS_FEED,
} from "../../apollo/private/feed";
import { privateClient, publicClient } from "../../apollo/client/index";
import { showMessage } from "./display";
import { SET_POSTS, CLEAR_POSTS } from "../types";
import { setCurrentKey } from "./display";
import { rollbar } from "../../reuseableFunctions/constants";

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
    if (skipMult == 0) {
      dispatch({
        type: CLEAR_POSTS,
        payload: {
          userId: "FOLLOWINGFEED",
        },
      });
    }
    dispatch({
      type: SET_POSTS,
      payload: {
        posts: res.data.getFollowingFeed.filter((el) => el),
        userId: "FOLLOWINGFEED",
      },
    });
    return res.data.getFollowingFeed;
  } catch (err) {
    rollbar.log(err);
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
    if (skipMult == 0) {
      dispatch({
        type: CLEAR_POSTS,
        payload: {
          userId: "TOPICSFEED",
        },
      });
    }
    dispatch({
      type: SET_POSTS,
      payload: {
        posts: res.data.getFollowingTopicsFeed.filter((el) => el),
        userId: "TOPICSFEED",
      },
    });
    return res.data.getFollowingTopicsFeed;
  } catch (err) {
    rollbar.log(err);
  }
};

export const getNotLoggedInFeed = (skipMult) => async (dispatch) => {
  try {
    const res = await publicClient.query({
      query: GET_NOT_LOGGED_IN_FEED,
      variables: { skipMult },
      fetchPolicy: "no-cache",
    });
    console.log(res.data.getNotLoggedInFeed);
    if (!res || !res.data || !res.data.getNotLoggedInFeed) {
      dispatch(
        showMessage({ success: false, message: "Fetching feed failed" })
      );
    }
    if (skipMult == 0) {
      dispatch({
        type: CLEAR_POSTS,
        payload: {
          userId: "NOTLOGGEDINFEED",
        },
      });
    }
    dispatch({
      type: SET_POSTS,
      payload: {
        posts: res.data.getNotLoggedInFeed.filter((el) => el),
        userId: "NOTLOGGEDINFEED",
      },
    });
    return res.data.getNotLoggedInFeed;
  } catch (err) {
    rollbar.log(err);
  }
};
