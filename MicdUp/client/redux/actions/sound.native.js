import { CHANGE_SOUND, SOUND_ENDED, SOUND_PAUSE, SET_TIME } from "../types";
import { playSound } from "../../reuseableFunctions/helpers";
import store from "../index";
import { Audio } from "expo-av";
import { addListenerAuthenticated, addListener } from "./recording";
import { rollbar } from "../../reuseableFunctions/constants";
import { PitchAlgorithm } from "react-native-track-player";
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
    try {
      if (user && currentPlayingSound.id && user._id) {
        dispatch(addListenerAuthenticated(currentPlayingSound.id, time));
      } else if (ipAddr && currentPlayingSound.id) {
        dispatch(addListener(currentPlayingSound.id, ipAddr, time));
      }
    } catch (err) {
      console.log(err, "add listen err");
      rollbar.log(err, "add listen err");
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
  await TrackPlayer.reset();
  await TrackPlayer.add(tracks);
  await TrackPlayer.skip(currIndex);
  await TrackPlayer.play();
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
const calls = {};
export const trackEnded =
  (currentPlayingSoundFromQueue, queue, currIndex, prevIndex) =>
  async (dispatch) => {
    let { user, ipAddr } = store.getState().auth;
    let { currentPlayingSound, currentIntervalId, time } =
      store.getState().sound;

    try {
      const duration = await TrackPlayer.getDuration();
      if (
        user &&
        currentPlayingSoundFromQueue &&
        currentPlayingSoundFromQueue.id &&
        user._id
      ) {
        dispatch(
          addListenerAuthenticated(currentPlayingSoundFromQueue.id, duration)
        );
      } else if (
        currentPlayingSoundFromQueue &&
        currentPlayingSoundFromQueue.id &&
        ipAddr
      ) {
        dispatch(
          addListener(currentPlayingSoundFromQueue.id, ipAddr, duration)
        );
      }
    } catch (err) {
      console.log(err, "add listen err");
      rollbar.log(err, "add listen err");
    }

    if (queue && queue.length > 0 && currIndex && currIndex < queue.length) {
      calls[queue[currIndex].signedUrl] = 1;
      dispatch({
        type: CHANGE_SOUND,
        payload: {
          currentPlayingSound: queue[currIndex],
          intervalId: "",
          queue,
          currIndex,
        },
      });
    } else if (
      !currIndex &&
      queue[prevIndex].signedUrl == currentPlayingSound.signedUrl &&
      calls[currentPlayingSound.signedUrl]
    ) {
      delete calls[currentPlayingSound.signedUrl];
      dispatch({
        type: CHANGE_SOUND,
        payload: {
          currentPlayingSound: "",
          intervalId: "",
          queue: [],
          currIndex: 0,
        },
      });
    } else {
      calls[currentPlayingSound.signedUrl] = 1;
    }
  };
