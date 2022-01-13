import {
  CHANGE_LOGIN,
  CHANGE_SIGNUP,
  DISPLAY_MESSAGE,
  HIDE_MESSAGE,
  NAVIGATE,
  VIEW_PROFILE,
  SET_BIO,
  VIEW_PROFILE_SEARCH,
  UPDATE_FOLLOWER_COUNT,
} from "../types";

const initialState = {
  showLogin: false,
  showSignup: false,
  displayMessage: false,
  currentMessage: "",
  messageState: false,
  mountedComponent: "Feed",
  viewingProfile: {},
  keyForSearch: Math.random(),
  searchViewingProfile: false,
};

export default function (state = { ...initialState }, action) {
  const { type, payload } = action;
  switch (type) {
    case NAVIGATE:
      return {
        ...state,
        mountedComponent: payload,
        keyForSearch: Math.random(),
        searchViewingProfile: false,
      };
    case CHANGE_LOGIN:
      return {
        ...state,
        showLogin: payload,
      };
    case CHANGE_SIGNUP:
      return {
        ...state,
        showSignup: payload,
      };
    case DISPLAY_MESSAGE:
      return {
        ...state,
        displayMessage: true,
        currentMessage: payload.message,
        messageState: payload.success,
      };
    case HIDE_MESSAGE:
      return {
        ...state,
        displayMessage: false,
        currentMessage: "",
        messageState: false,
      };
    case VIEW_PROFILE:
      return {
        ...state,
        viewingProfile: payload,
      };
    case SET_BIO:
      return {
        ...state,
        viewingProfile: {
          ...state.viewingProfile,
          bio: { ...payload },
        },
      };
    case UPDATE_FOLLOWER_COUNT:
      return {
        ...state,
        viewingProfile: {
          ...state.viewingProfile,
          followersCount: payload.followersCount,
          isFollowedByUser: payload.isFollowedByUser,
        },
      };
    case VIEW_PROFILE_SEARCH:
      return {
        ...state,
        searchViewingProfile: payload,
      };
    default:
      return state;
  }
}
