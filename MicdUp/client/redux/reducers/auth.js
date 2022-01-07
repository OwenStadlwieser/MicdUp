import {
  DELETE_ACCOUNT,
  LOG_IN,
  LOG_OUT,
  SET_USER,
  SET_BIO,
  SET_POSTS,
  UPDATE_POST,
  UPDATE_PROFILE_PIC,
  UPDATE_POST_COMMENT,
  UPDATE_POST_COMMENTS,
  UPDATE_POST_COMMENT2,
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
    case UPDATE_POST_COMMENT:
      const posts2 = [...state.posts];
      const post2Index = posts2.findIndex((post) => post.id === payload.id);
      const comments = posts2[post2Index].comments;
      const commentIndex = comments.findIndex(
        (comment) => comment.id === payload.data.id
      );
      if (commentIndex > -1) {
        comments[commentIndex] = payload.data;
        posts2[post2Index].comments = [...comments];
      } else {
        posts2[post2Index].comments.push(payload.data);
      }
      return {
        ...state,
        posts: [...posts2],
      };
    case UPDATE_POST_COMMENTS:
      const posts3 = [...state.posts];
      const post3Index = posts3.findIndex((post) => post.id === payload.id);
      posts3[post3Index].comments = payload.data;
      return {
        ...state,
        posts: [...posts3],
      };
    case UPDATE_POST_COMMENT2:
      const posts4 = [...state.posts];
      let postIndex2 = posts4.findIndex((post) => post.id === payload.postId);
      let postTarget = posts4[postIndex2];
      let indicies = [];
      let comments2 = postTarget.comments;
      // comment to first layer or layer 0
      if (!payload.parents || payload.parents.length === 0) {
        let indexC = posts4[postIndex2].comments.findIndex(
          (comment) => comment.id === payload.comment.id
        );
        if (indexC === -1) {
          posts4[postIndex2].comments.push(payload.comment);
        } else {
          posts4[postIndex2].comments[indexC] = payload.comment;
        }
        return {
          ...state,
          posts: [...posts4],
        };
      }
      indicies.push(
        comments2.findIndex((comment) => comment.id === payload.parents[0])
      );
      comments2 = comments2[indicies[0]];
      for (let i = 0; payload.parents && i < payload.parents.length - 1; i++) {
        indicies.push(
          comments2.allReplies.findIndex(
            (comment) => comment.id === payload.parents[i + 1]
          )
        );
        comments2 = comments2.allReplies[indicies[i + 1]];
      }
      let finalIndex = comments2.allReplies.findIndex(
        (post) => post.id === payload.comment.id
      );
      comments2.allReplies[finalIndex] = payload.comment;
      posts4[postIndex2].comments = postTarget.comments;
      return {
        ...state,
        posts: [...posts4],
      };
    default:
      return state;
  }
}
