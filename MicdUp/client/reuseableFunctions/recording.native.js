import { Audio } from "expo-av";
import { rollbar } from "../reuseableFunctions/constants";

import { Platform } from "react-native";
const startRecording = async (Voice, onRecordingStatusUpdate) => {
  rollbar.log("Requesting permission..");
  await Audio.requestPermissionsAsync();
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  });
  rollbar.log("Requesting Voice..");
  try {
    Voice &&
      Platform.OS !== "web" &&
      (await Voice.isAvailable()) &&
      Voice.start("en-US");
  } catch (err) {
    rollbar.log(err);
  }
  rollbar.log("Starting recording..");
  const { recording } = await Audio.Recording.createAsync(
    Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY,
    onRecordingStatusUpdate
  );
  rollbar.log("Finished starting recording..");

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
