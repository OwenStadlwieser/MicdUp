import { Audio } from "expo-av";
import RNSoundLevel from "react-native-sound-level";
import { Platform } from "react-native";
const startRecording = async (onNewFrame, Voice, onRecordingStatusUpdate) => {
  try {
    await Audio.requestPermissionsAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
    RNSoundLevel.start(75);
    RNSoundLevel.onNewFrame = (data) => {
      onNewFrame(data);
    };
    console.log("Starting recording..");
    try {
      Voice &&
        Platform.OS !== "web" &&
        (await Voice.isAvailable()) &&
        Voice.start("en-US");
    } catch (err) {
      console.log(err);
    }
    const { recording } = await Audio.Recording.createAsync(
      Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY,
      onRecordingStatusUpdate
    );
    return recording;
    console.log("Recording started");
  } catch (err) {
    console.error("Failed to start recording", err);
  }
};

const stopRecording = async (recording, Voice) => {
  if (!recording || !recording.stopAndUnloadAsync) {
    return;
  }
  await recording.stopAndUnloadAsync();
  RNSoundLevel.stop();
  const uri = recording.getURI();
  try {
    Voice && Platform.OS !== "web" && Voice.stop();
  } catch (err) {
    console.log(err);
  }
};
export { startRecording, stopRecording };
