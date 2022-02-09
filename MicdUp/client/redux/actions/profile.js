import { UPDATE_PROFILE_PIC, UPDATE_FOLLOWER_COUNT } from "../types";
import { privateClient } from "../../apollo/client";
import { showMessage } from "./display";
import {
  UPDATE_PROFILE_PIC_MUTATION,
  FOLLOW_PROFILE_MUTATION,
} from "../../apollo/private/profile";

export const followProfile = (profileId) => async (dispatch) => {
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
