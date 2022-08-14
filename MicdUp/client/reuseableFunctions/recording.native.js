import { Audio } from "expo-av";
import { rollbar } from "../reuseableFunctions/constants";
import TrackPlayer from "react-native-track-player";
import { Platform } from "react-native";
const startRecording = async (Voice, onRecordingStatusUpdate) => {
  rollbar.log("Requesting permission..");
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    allowsRecordingIOS: true,
    staysActiveInBackground: true,
    interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DUCK_OTHERS,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
    interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
    playThroughEarpieceAndroid: false,
  });
  await Audio.requestPermissionsAsync();

  TrackPlayer.pause();
  rollbar.log("Starting recording..");
  const { recording } = await Audio.Recording.createAsync(
    Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY,
    onRecordingStatusUpdate
  );
  rollbar.log("Finished starting recording..");

  rollbar.log("Requesting Voice..");
  try {
    Voice &&
      Platform.OS !== "web" &&
      (await Voice.isAvailable()) &&
      Voice.start("en-US");
  } catch (err) {
    rollbar.log(err);
  }

  return recording;
};

const stopRecording = async (recording, Voice) => {
  if (!recording || !recording.stopAndUnloadAsync) {
    return;
  }
  await recording.stopAndUnloadAsync();
  const uri = recording.getURI();
  try {
    Voice && Platform.OS !== "web" && Voice.stop();
  } catch (err) {
    rollbar.log(err);
  }
  return uri;
};
export { startRecording, stopRecording };
