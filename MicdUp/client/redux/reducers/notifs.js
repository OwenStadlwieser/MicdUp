import {
  SET_NOTIFS,
  APPEND_NOTIFS,
  UPDATE_NOTIFS_UNSEEN,
  RECEIVE_NOTIF,
} from "../types";

const initialState = {
  notifs: [],
  unseenNotifs: 0,
};

export default function (state = { ...initialState }, action) {
  const { type, payload } = action;
  switch (type) {
    case SET_NOTIFS:
      return {
        ...state,
        notifs: payload,
      };
    case APPEND_NOTIFS:
      console.log(payload.length > 0);
      return {
        ...state,
        notifs:
          payload.length > 0
            ? [...state.notifs, ...payload]
            : [...state.notifs],
      };
    case UPDATE_NOTIFS_UNSEEN:
      return {
        ...state,
        unseenNotifs: payload,
      };
    case RECEIVE_NOTIF:
      return {
        ...state,
        notifs: [...state.notifs, payload],
        unseenNotifs: state.unseenNotifs + 1,
      };
    default:
      return state;
  }
}
