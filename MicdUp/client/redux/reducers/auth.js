import {
  DELETE_ACCOUNT,
  LOG_IN,
  LOG_OUT,
  SET_USER,
  SET_BIO,
  SET_POSTS,
  UPDATE_POST,
  UPDATE_PROFILE_PIC,
} from "../types";

const initialState = {
  loggedIn: false,
  user: {},
  profile: {},
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
    case DELETE_ACCOUNT:
      return {
        ...state,
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
    case UPDATE_PROFILE_PIC:
      return {
        ...state,
        user: {
          ...state.user,
          profile: {
            ...state.user.profile,
            image: { ...payload },
          },
        },
      };
    case SET_POSTS:
      return {
        ...state,
        posts: [...payload],
      };
    case UPDATE_POST:
      const posts = [...state.posts];
      const postIndex = posts.findIndex((post) => post.id === payload.id);
      posts[postIndex] = payload;
      return {
        ...state,
        posts: [...posts],
      };
    default:
      return state;
  }
}
