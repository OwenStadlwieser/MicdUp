import { CHANGE_SOUND, SOUND_ENDED, SOUND_PAUSE, SET_TIME } from "../types";
import { playSound } from "../../reuseableFunctions/helpers";
import store from "../index";
import { Audio } from "expo-av";
import { addListenerAuthenticated, addListener } from "./recording";
import { rollbar } from "../../reuseableFunctions/constants";
import { showMessage } from "./display";
import { PitchAlgorithm } from "react-native-track-player";
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
  } else if (currentPlayingSound) {
    const state = await TrackPlayer.getState();
    if (state === State.Paused) {
      TrackPlayer.play();
      dispatch({
        type: SOUND_PAUSE,
        payload: false,
      });
    }
    return;
  }
  const tracks = queue.map((el) => {
    el.url = el.signedUrl;
    el.artist = el.owner ? el.owner.user.userName : "Unknown Artist";
    el.artwork = el.owner
      ? el.owner.image
        ? el.owner.image.signedUrl
        : null
      : null;
    el.pitchAlgorith = PitchAlgorithm.Voice;
    return el;
  });
  TrackPlayer.add(tracks);
  await TrackPlayer.skip(currIndex);
  TrackPlayer.play();
  dispatch({
    type: CHANGE_SOUND,
    payload: {
      currentPlayingSound: queue[currIndex],
      intervalId: "",
      queue,
      currIndex,
    },
  });
};

export const trackEnded =
  (currentPlayingSound, queue, currIndex, duration) => async (dispatch) => {
    let { user, ipAddr } = store.getState().auth;
    if (user && currentPlayingSound && currentPlayingSound.id && user._id) {
      dispatch(addListenerAuthenticated(currentPlayingSound.id, duration));
    } else if (currentPlayingSound && currentPlayingSound.id && ipAddr) {
      dispatch(addListener(currentPlayingSound.id, ipAddr, duration));
    }
    if (queue && queue.length > 0 && currIndex && currIndex < queue.length) {
      dispatch({
        type: CHANGE_SOUND,
        payload: {
          currentPlayingSound: queue[currIndex],
          intervalId: "",
          queue,
          currIndex,
        },
      });
    }
  };
