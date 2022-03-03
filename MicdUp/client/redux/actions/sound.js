import { CHANGE_SOUND, SOUND_ENDED, SOUND_PAUSE, SET_TIME } from "../types";
import { playSound } from "../../reuseableFunctions/helpers";
import store from "../index";
import { Audio } from "expo-av";
import { addListenerAuthenticated, addListener } from "./recording";

const soundExpo = new Audio.Sound();

export const changeSound = (sound, url, queue) => async (dispatch) => {
  let { currentPlayingSound, currentPlaybackObject, currentIntervalId, time } =
    store.getState().sound;
  let { user, ipAddr } = store.getState().auth;
  sound.uri = url;
  if (currentPlayingSound && currentPlayingSound.uri !== url) {
    if (user && currentPlayingSound.id && user._id) {
      dispatch(addListenerAuthenticated(currentPlayingSound.id, time));
    } else if (ipAddr && currentPlayingSound.id) {
      dispatch(addListener(currentPlayingSound.id, ipAddr, time));
    }
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
      let { queue, currentPlayingSound } = store.getState().sound;
      let { user, ipAddr } = store.getState().auth;
      console.log(currentPlayingSound.id, ipAddr);
      if (user && currentPlayingSound.id && user._id) {
        dispatch(
          addListenerAuthenticated(
            currentPlayingSound.id,
            status.durationMillis
          )
        );
      } else if (currentPlayingSound.id && ipAddr) {
        console.log("here");
        dispatch(
          addListener(currentPlayingSound.id, ipAddr, status.durationMillis)
        );
      }
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
    } else {
      await dispatch(
        setTime({
          time: status.positionMillis,
          duration: status.durationMillis,
        })
      );
    }
  }, 100);
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

export const setTime = (time) => async (dispatch) => {
  dispatch({
    type: SET_TIME,
    payload: time,
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
