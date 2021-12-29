import AsyncStorage from "@react-native-async-storage/async-storage";
const storeData = async (key, value) => {
  try {
    console.log(key, value);
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
export { storeData, getData };
