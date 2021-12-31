import { ALTER_CLIPS } from "../types";

const initialState = {
  clips: [],
};

export default function (state = { ...initialState }, action) {
  const { type, payload } = action;
  switch (type) {
    case ALTER_CLIPS:
      return {
        ...state,
        clips: payload,
      };
    default:
      return state;
  }
}
