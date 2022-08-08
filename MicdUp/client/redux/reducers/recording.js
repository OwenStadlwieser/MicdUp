import {
  ALTER_CLIPS,
  UPDATE_TITLE,
  UPDATE_TAGS,
  CLEAR_RECORDING,
  DELETE_TAG,
} from "../types";

const initialState = {
  clips: [],
  title: "",
  tags: [],
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
    case DELETE_TAG:
      let tags = [...state.tags];
      tags.splice(payload, 1);
      return {
        ...state,
        tags: [...tags],
      };
    case UPDATE_TAGS:
      return {
        ...state,
        tags: [...state.tags, payload],
      };
    case CLEAR_RECORDING:
      return {
        ...initialState,
      };
    default:
      return state;
  }
}
