import { CHANGE_SOUND, SOUND_ENDED, SOUND_PAUSE, SET_TIME } from "../types";
import { playSound } from "../../reuseableFunctions/helpers";
import store from "../index";
import { Audio } from "expo-av";
import { addListenerAuthenticated, addListener } from "./recording";
import { rollbar } from "../../reuseableFunctions/constants";
import { showMessage } from "./display";

const soundExpo = new Audio.Sound();

export const changeSound = (currIndex, queue) => async (dispatch) => {
  let { currentPlayingSound, currentIntervalId, time } = store.getState().sound;
  let { user, ipAddr } = store.getState().auth;
  console.log(currIndex, queue.length);
  if (!queue[currIndex]) {
    dispatch(showMessage({ success: false, message: "No sound to play" }));
    clearInterval(currentIntervalId);
    return;
  }

  if (
    currentPlayingSound &&
    currentPlayingSound.signedUrl !== queue[currIndex].signedUrl
  ) {
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
  const playbackObject = await playSound(queue[currIndex].signedUrl, soundExpo);
  const intervalId = setInterval(async () => {
    try {
      const status = await playbackObject.getStatusAsync();
      if (
        status.didJustFinish ||
        status.durationMillis === status.positionMillis
      ) {
        let { queue, currentPlayingSound, currIndex } = store.getState().sound;
        let { user, ipAddr } = store.getState().auth;
        if (user && currentPlayingSound && currentPlayingSound.id && user._id) {
          dispatch(
            addListenerAuthenticated(
              currentPlayingSound.id,
              status.durationMillis
            )
          );
        } else if (currentPlayingSound && currentPlayingSound.id && ipAddr) {
          dispatch(
            addListener(currentPlayingSound.id, ipAddr, status.durationMillis)
          );
        }
        if (queue && queue.length > 0) {
          clearInterval(intervalId);
          await dispatch(changeSound(currIndex + 1, queue));
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
    } catch (err) {
      rollbar.log(err);
      clearInterval(intervalId);
    }
  }, 100);
  dispatch({
    type: CHANGE_SOUND,
    payload: {
      currentPlayingSound: queue[currIndex],
      intervalId,
      currentPlaybackObject: playbackObject,
      queue,
      currIndex,
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
