import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
const storeData = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    // saving error
  }
};

const getData = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      return value;
      // value previously stored
    }
  } catch (e) {
    // error reading value
  }
};

const removeItemValue = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (exception) {
    return false;
  }
};

const clearAsyncStorage = async () => {
  AsyncStorage.clear();
};

const playSound = async (uri, onPlayBackStatusUpdate) => {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      allowsRecordingIOS: false,
    });
    const playbackObject = new Audio.Sound();
    // OR
    const res = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true },
      onPlayBackStatusUpdate
    );
    return res.sound;
  } catch (err) {
    console.log(err);
  }
};

export { storeData, getData, removeItemValue, clearAsyncStorage, playSound };
