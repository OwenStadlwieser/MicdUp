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
  UPDATE_CURRENT_RECORDINGS,
  RECEIVE_NOTIF,
  HIDE_NOTIF,
  SHOW_COMMENTS,
  HIDE_COMMENTS,
  UPDATE_FOLLOW_COUNTS,
  UPDATE_PRIVATE_COUNT,
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
  viewingPostsSearch: [],
  receiveNotif: false,
  showingComments: false,
  postIndex: -1,
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
    case UPDATE_CURRENT_RECORDINGS:
      return {
        ...state,
        viewingPostsSearch: payload,
      };
    case SHOW_COMMENTS:
      return {
        ...state,
        postIndex: payload,
        showingComments: true,
      };
    case HIDE_COMMENTS:
      return {
        ...state,
        showingComments: false,
      };
    case RECEIVE_NOTIF:
      return {
        ...state,
        receiveNotif: true,
      };
    case HIDE_NOTIF:
      return {
        ...state,
        receiveNotif: false,
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
    case UPDATE_PRIVATE_COUNT:
      return {
        ...state,
        viewingProfile: {
          ...state.viewingProfile,
          privatesCount: payload.privatesCount,
          isPrivateByUser: payload.isPrivateByUser,
        },
      };
    case UPDATE_FOLLOW_COUNTS:
      return {
        ...state,
        viewingProfile: {
          ...state.viewingProfile,
          followingCount: payload.followingCount,
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
