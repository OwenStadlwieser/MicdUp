import { CHANGE_SOUND, SOUND_ENDED, SOUND_PAUSE, SET_TIME } from "../types";
import { playSound } from "../../reuseableFunctions/helpers";
import store from "../index";
import { Audio } from "expo-av";
import { addListenerAuthenticated, addListener } from "./recording";
import { rollbar } from "../../reuseableFunctions/constants";
import { showMessage } from "./display";
import {
  updateMusicControlPause,
  updateMusicControlNewSoundPlaying,
} from "../../reuseableFunctions/constants";
import TrackPlayer, { State } from "react-native-track-player";

const soundExpo = new Audio.Sound();

export const setTime = (time) => async (dispatch) => {
  dispatch({
    type: SET_TIME,
    payload: time,
  });
};

export const pauseSound = () => async (dispatch) => {
  const state = await TrackPlayer.getState();
  if (state === State.Playing) {
    TrackPlayer.pause();
    dispatch({
      type: SOUND_PAUSE,
      payload: true,
    });
  }
};

export const changeSound = (currIndex, queue) => async (dispatch) => {
  let { currentPlayingSound, currentIntervalId, time } = store.getState().sound;
  let { user, ipAddr } = store.getState().auth;

  if (!queue[currIndex]) {
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
    TrackPlayer.stop();
    clearInterval(currentIntervalId);
  } else if (currentPlayingSound) {
    const state = await TrackPlayer.getState();
    if (state === State.Paused) {
      TrackPlayer.play();
      dispatch({
        type: SOUND_PAUSE,
        payload: false,
      });
    }
  }
  TrackPlayer.add(queue);
  await TrackPlayer.skip(currIndex);
  TrackPlayer.play();
  const state = await TrackPlayer.getState();

  const intervalId = setInterval(async () => {
    try {
      const status = await state.getStatusAsync();
      if (TrackPlayer.getPosition() === TrackPlayer.getDuration()) {
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
          await dispatch(changeSoundTrackPlayer(currIndex + 1, queue));
          return;
        }
        TrackPlayer.stop();
        clearInterval(intervalId);
        dispatch({
          type: SOUND_ENDED,
        });
      } else {
        await dispatch(
          setTime({
            time: TrackPlayer.getPosition(),
            duration: TrackPlayer.getDuration(),
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
