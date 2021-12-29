import AsyncStorage from "@react-native-async-storage/async-storage";
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

export { storeData, getData, removeItemValue };
