import { LOG_IN, LOG_OUT, SET_USER, SET_BIO, SET_POSTS } from "../types";

const initialState = {
  loggedIn: false,
  user: {},
  posts: [],
};

export default function (state = { ...initialState }, action) {
  const { type, payload } = action;
  switch (type) {
    case LOG_IN:
      return {
        ...state,
        loggedIn: true,
      };
    case SET_USER:
      return {
        ...state,
        user: { ...payload },
      };
    case LOG_OUT:
      return {
        ...state,
        user: {},
        loggedIn: false,
      };
    case SET_BIO:
      return {
        ...state,
        user: {
          ...state.user,
          profile: {
            ...state.user.profile,
            bio: { ...payload },
          },
        },
      };
    case SET_POSTS:
      return {
        ...state,
        posts: [...payload],
      };
    default:
      return state;
  }
}
