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
  RECEIVE_NOTIF,
  HIDE_NOTIF,
  SHOW_COMMENTS,
  UPDATE_FOLLOW_COUNTS,
  UPDATE_PRIVATE_COUNT,
  UPDATE_PRIVATE_COUNT_FROM_LIST,
  REMOVE_LOADING,
  ADD_LOADING,
  VIEW_TAG_SEARCH,
  SHOW_HEADER,
  CURRENT_PROFILE_BLOCKED,
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
  receiveNotif: false,
  postIndex: -1,
  loading: false,
  loadingMap: {},
  tagFromSearch: {},
  searchViewingTag: false,
  showHeader: true,
};

export default function (state = { ...initialState }, action) {
  const { type, payload } = action;
  let copy;
  switch (type) {
    case SHOW_HEADER:
      return {
        ...state,
        showHeader: payload,
      };
    case VIEW_TAG_SEARCH:
      return {
        ...state,
        searchViewingTag: true,
        tagFromSearch: payload,
      };
    case NAVIGATE:
      return {
        ...state,
        mountedComponent: payload,
        keyForSearch: Math.random(),
        searchViewingProfile: false,
        searchViewingTag: false,
        tagFromSearch: {},
      };
    case ADD_LOADING:
      copy = { ...state.loadingMap };
      copy[payload] = true;
      return {
        ...state,
        loadingMap: copy,
        loading: Object.keys(copy).length > 0,
      };
    case REMOVE_LOADING:
      copy = { ...state.loadingMap };
      delete copy[payload];
      return {
        ...state,
        loadingMap: copy,
        loading: Object.keys(copy).length > 0,
      };
    case SHOW_COMMENTS:
      return {
        ...state,
        postIndex: payload,
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
    case CURRENT_PROFILE_BLOCKED:
      return {
        ...state,
        viewingProfile: {
          ...state.viewingProfile,
          isBlockedByUser: payload,
        },
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
    case UPDATE_PRIVATE_COUNT_FROM_LIST:
      return {
        ...state,
        viewingProfile: {
          ...state.viewingProfile,
          privatesCount: payload.privatesCount,
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
