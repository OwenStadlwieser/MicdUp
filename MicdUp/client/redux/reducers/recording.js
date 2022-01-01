import { ALTER_CLIPS, UPDATE_TITLE } from "../types";

const initialState = {
  clips: [],
  title: "",
};

export default function (state = { ...initialState }, action) {
  const { type, payload } = action;
  switch (type) {
    case ALTER_CLIPS:
      return {
        ...state,
        clips: payload,
      };
    case UPDATE_TITLE:
      return {
        ...state,
        title: payload,
      };
    default:
      return state;
  }
}
