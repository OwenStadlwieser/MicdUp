import { CHANGE_SOUND, SOUND_ENDED, SOUND_PAUSE } from "../types";
import { playSound } from "../../reuseableFunctions/helpers";
import store from "../index";
import { Audio } from "expo-av";

const soundExpo = new Audio.Sound();

export const changeSound = (sound, url, queue) => async (dispatch) => {
  let { currentPlayingSound, currentPlaybackObject, currentIntervalId } =
    store.getState().sound;
  sound.uri = url;
  if (currentPlayingSound && currentPlayingSound.uri != url) {
    await soundExpo.unloadAsync();
    clearInterval(currentIntervalId);
  } else if (currentPlayingSound) {
    const result = await soundExpo.getStatusAsync();
    if (result.isLoaded) {
      if (result.isPlaying === false) {
        soundExpo.playAsync();
        dispatch({
          type: SOUND_PAUSE,
          payload: false,
        });
        return;
      }
    }
  }
  const playbackObject = await playSound(sound.uri, soundExpo);
  const intervalId = setInterval(async () => {
    const status = await playbackObject.getStatusAsync();
    if (
      status.didJustFinish ||
      status.durationMillis === status.positionMillis
    ) {
      let { queue } = store.getState().sound;
      if (queue && queue.length > 0) {
        let newSound = queue.shift();
        await dispatch(changeSound(newSound, newSound.signedUrl, queue));
        return;
      }
      await soundExpo.unloadAsync();
      clearInterval(intervalId);
      dispatch({
        type: SOUND_ENDED,
      });
    }
  }, 500);
  dispatch({
    type: CHANGE_SOUND,
    payload: {
      currentPlayingSound: sound,
      intervalId,
      currentPlaybackObject: playbackObject,
      queue,
    },
  });
};

export const pauseSound = () => async (dispatch) => {
  const result = await soundExpo.getStatusAsync();
  if (result.isLoaded) {
    if (result.isPlaying === true) {
      soundExpo.pauseAsync();
      dispatch({
        type: SOUND_PAUSE,
        payload: true,
      });
    }
  }
};

export const searchViewProfile = (payload) => (dispatch) => {
  dispatch({
    type: VIEW_PROFILE_SEARCH,
    payload,
  });
};
