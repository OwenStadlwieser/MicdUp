import { CHANGE_SOUND, SOUND_ENDED, SOUND_PAUSE } from "../types";

const initialState = {
  currentPlayingSound: null,
  currentPlaybackObject: {},
  queue: [],
  currentIntervalId: "",
  isPause: false,
};

export default function (state = { ...initialState }, action) {
  const { type, payload } = action;
  switch (type) {
    case CHANGE_SOUND:
      return {
        ...state,
        currentPlayingSound: payload.currentPlayingSound,
        currentPlaybackObject: payload.currentPlaybackObject,
        queue: payload.queue,
        currentIntervalId: payload.currentIntervalId,
        isPause: false,
      };
    case SOUND_ENDED:
      let queue = { state };
      if (queue && queue.length > 0) {
        let newSound = queue.shift();
        return {
          ...state,
          currentPlayingSound: newSound,
          queue: [...queue],
        };
      }
      return {
        ...state,
        currentPlayingSound: null,
        currentIntervalId: "",
      };
    case SOUND_PAUSE:
      return {
        ...state,
        isPause: payload,
      };
    default:
      return state;
  }
}
