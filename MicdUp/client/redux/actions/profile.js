import {
  UPDATE_PROFILE_PIC,
  UPDATE_FOLLOWER_COUNT,
  UPDATE_FOLLOW_COUNTS,
  UPDATE_PRIVATE_COUNT,
  UPDATE_PRIVATE_COUNT_FROM_LIST,
} from "../types";
import { privateClient, publicClient } from "../../apollo/client";
import { showMessage } from "./display";
import {
  UPDATE_PROFILE_PIC_MUTATION,
  FOLLOW_PROFILE_MUTATION,
  GET_FOLLOWERS_QUERY,
  GET_PRIVATES_QUERY,
  ADD_TO_PRIVATES_MUTATION,
  GET_FOLLOWING_QUERY,
  BLOCK_PROFILE_MUTATION,
} from "../../apollo/private/profile";

export const blockProfile = (profileId, blocking) => async (dispatch) => {
  const res = await privateClient.mutate({
    mutation: BLOCK_PROFILE_MUTATION,
    variables: {
      profileId,
      blocking,
    },
    fetchPolicy: "no-cache",
  });
  if (!res.data || !res.data.blockProfile) {
    dispatch(
      showMessage({
        success: false,
        message: "Something went wrong. Please contact support.",
      })
    );
    return !blocking;
  }
  dispatch(
    showMessage({
      success: res.data.blockProfile.success,
      message: res.data.blockProfile.message,
    })
  );
  return blocking;
};
export const followProfile =
  (profileId, followingFromProfile = true) =>
  async (dispatch) => {
    try {
      const res = await privateClient.mutate({
        mutation: FOLLOW_PROFILE_MUTATION,
        variables: {
          profileId,
        },
        fetchPolicy: "no-cache",
      });
      if (!res.data || !res.data.followProfile) {
        dispatch(
          showMessage({
            success: false,
            message: "Something went wrong. Please contact support.",
          })
        );
        return false;
      }
      dispatch({
        type: UPDATE_FOLLOWER_COUNT,
        payload: { ...res.data.followProfile },
      });
      return res.data.followProfile;
    } catch (err) {
      console.log(err);
    }
  };

export const updateFollowCounts = (followingCount) => (dispatch) => {
  try {
    dispatch({
      type: UPDATE_FOLLOW_COUNTS,
      payload: { followingCount },
    });
  } catch (err) {
    console.log(err);
  }
};

export const updatePrivateCounts = (privatesCount) => (dispatch) => {
  try {
    dispatch({
      type: UPDATE_PRIVATE_COUNT_FROM_LIST,
      payload: { privatesCount },
    });
  } catch (err) {
    console.log(err);
  }
};

export const updateProfilePic =
  (file, base64, fileType) => async (dispatch) => {
    try {
      dispatch({
        type: UPDATE_PROFILE_PIC,
        payload: { signedUrl: file },
      });
      const res = await privateClient.mutate({
        mutation: UPDATE_PROFILE_PIC_MUTATION,
        variables: {
          file: base64,
          fileType,
        },
        fetchPolicy: "no-cache",
      });
      if (!res.data || !res.data.updateProfilePic) {
        dispatch(
          showMessage({
            success: false,
            message: "Something went wrong. Please contact support.",
          })
        );
        return false;
      }
      dispatch({
        type: UPDATE_PROFILE_PIC,
        payload: { ...res.data.updateProfilePic },
      });
      return true;
    } catch (err) {
      console.log(err);
    }
  };

export const getFollowersQuery =
  (profileId, skipMult = 0) =>
  async (dispatch) => {
    try {
      const res = await publicClient.query({
        query: GET_FOLLOWERS_QUERY,
        variables: {
          profileId,
          skipMult,
        },
        fetchPolicy: "no-cache",
      });
      if (!res.data || !res.data.getFollowers) {
        dispatch(
          showMessage({
            success: false,
            message: "Something went wrong. Please contact support.",
          })
        );
        return false;
      }
      return res.data.getFollowers;
    } catch (err) {
      console.log(err);
    }
  };

export const getFollowingQuery = (profileId, skipMult) => async (dispatch) => {
  try {
    const res = await publicClient.query({
      query: GET_FOLLOWING_QUERY,
      variables: {
        profileId,
        skipMult,
      },
      fetchPolicy: "no-cache",
    });
    if (!res.data || !res.data.getFollowing) {
      dispatch(
        showMessage({
          success: false,
          message: "Something went wrong. Please contact support.",
        })
      );
      return false;
    }
    return res.data.getFollowing;
  } catch (err) {
    console.log(err);
  }
};

export const getPrivatesQuery = (skipMult) => async (dispatch) => {
  try {
    const res = await privateClient.query({
      query: GET_PRIVATES_QUERY,
      variables: {
        skipMult,
      },
      fetchPolicy: "no-cache",
    });
    if (!res.data || !res.data.getPrivates) {
      dispatch(
        showMessage({
          success: false,
          message: "Something went wrong. Please contact support.",
        })
      );
      return false;
    }
    return res.data.getPrivates;
  } catch (err) {
    console.log(err);
  }
};

export const addToPrivates =
  (profileId, isPrivate, addingFromProfile = true) =>
  async (dispatch) => {
    try {
      const res = await privateClient.mutate({
        mutation: ADD_TO_PRIVATES_MUTATION,
        variables: {
          profileId,
        },
        fetchPolicy: "no-cache",
      });
      if (!res.data || !res.data.addToPrivates) {
        dispatch(
          showMessage({
            success: false,
            message: "Something went wrong. Please contact support.",
          })
        );
        return false;
      }
      if (!isPrivate)
        dispatch(
          showMessage({
            success: true,
            message: `${res.data.addToPrivates.user.userName} can now see your private posts`,
          })
        );
      else
        dispatch(
          showMessage({
            success: false,
            message: `${res.data.addToPrivates.user.userName} can no longer see your private posts`,
          })
        );
      dispatch({
        type: UPDATE_PRIVATE_COUNT,
        payload: { ...res.data.addToPrivates },
      });
      return res.data.addToPrivates;
    } catch (err) {
      console.log(err);
    }
  };
