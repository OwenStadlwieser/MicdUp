import { DELETE_ACCOUNT, LOG_IN, LOG_OUT, SET_USER } from "../types";

const initialState = {
  loggedIn: false,
  user: {},
  profile: {},
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
    default:
      return state;
  }
}
