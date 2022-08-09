import { Audio } from "expo-av";
import { Platform } from "react-native";
import { rollbar } from "../reuseableFunctions/constants";

const startRecording = async (Voice, onRecordingStatusUpdate) => {
  try {
    await Audio.requestPermissionsAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
    console.log("Starting recording..");
    try {
      Voice &&
        Platform.OS !== "web" &&
        (await Voice.isAvailable()) &&
        Voice.start("en-US");
    } catch (err) {
      rollbar.log(err);
    }
    const { recording } = await Audio.Recording.createAsync(
      Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY,
      onRecordingStatusUpdate
    );
    return recording;
  } catch (err) {
    console.error("Failed to start recording", err);
  }
};

const stopRecording = async (recording) => {
  if (!recording || !recording.stopAndUnloadAsync) {
    return;
  }
  await recording.stopAndUnloadAsync();
  const uri = recording.getURI();
  return uri;
};
export { startRecording, stopRecording };
