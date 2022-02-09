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
    return false;
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

const playSound = async (uri, sound) => {
  try {
    const playbackObject = sound;
    // OR
    const result = await sound.getStatusAsync();
    if (!result.isLoaded)
      await playbackObject.loadAsync({ uri }, { shouldPlay: true }, () => {});
    await playbackObject.playAsync();
    return playbackObject;
  } catch (err) {
    console.log(err);
  }
};

const duplicateNotifsString = (n) => {
  let string = "";
  for (let i = 0; i < n; i++) {
    let tabString = "";
    let tabStringC = "\t";
    for (let j = 0; j < i; j++) {
      tabString = tabString + tabStringC;
    }
    let startString = `${tabString}allReplies {
      ${tabString}id
      ${tabString}text
      ${tabString}notifsLength
      ${tabString}signedUrl
      ${tabString}navTo
      ${tabString}owner {
        ${tabString}id
        ${tabString}user {
          ${tabString}id
          ${tabString}userName
          ${tabString}}
          ${tabString}image {
            ${tabString}id
            ${tabString}signedUrl
            ${tabString}}
          ${tabString}}
    `;
    string = string + startString;
  }
  for (let i = n; i > 0; i--) {
    let tabString = "";
    let tabStringC = "\t";
    for (let j = i; j > 0; j--) {
      tabString = tabString + tabStringC;
    }
    string = string + `${tabString}}\n`;
  }
  return string;
};

const duplicateCommentsString = (n) => {
  let string = "";
  for (let i = 0; i < n; i++) {
    let tabString = "";
    let tabStringC = "\t";
    for (let j = 0; j < i; j++) {
      tabString = tabString + tabStringC;
    }
    let startString = `${tabString}allReplies {
      ${tabString}id
      ${tabString}text
      ${tabString}repliesLength
      ${tabString}signedUrl
      ${tabString}isDeleted
      ${tabString}likes
      ${tabString}isLikedByUser
      ${tabString}speechToText{
        ${tabString}word
        ${tabString}time
      ${tabString}}
      ${tabString}owner {
        ${tabString}id
        ${tabString}user {
          ${tabString}id
          ${tabString}userName
          ${tabString}}
          ${tabString}image {
            ${tabString}id
            ${tabString}signedUrl
            ${tabString}}
          ${tabString}}
    `;
    string = string + startString;
  }
  for (let i = n; i > 0; i--) {
    let tabString = "";
    let tabStringC = "\t";
    for (let j = i; j > 0; j--) {
      tabString = tabString + tabStringC;
    }
    string = string + `${tabString}}\n`;
  }
  return string;
};
const soundBlobToBase64 = async (uri) => {
  const blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      try {
        resolve(xhr.response);
      } catch (error) {
        console.log("error:", error);
      }
    };
    xhr.onerror = (e) => {
      console.log(e);
      reject(new TypeError("Network request failed"));
    };
    xhr.responseType = "blob";
    xhr.open("GET", uri, true);
    xhr.send(null);
  });
  const base64Url = await new Promise((resolve, reject) => {
    var reader = new FileReader();

    reader.onload = function () {
      var blobAsDataUrl = reader.result;
      blobAsDataUrl = blobAsDataUrl.substr(blobAsDataUrl.indexOf(", ") + 1);
      resolve(blobAsDataUrl);
    };

    reader.readAsDataURL(blob);
  });
  return base64Url;
};

function onSpeechStart() {
  this.mounted && this.setState({ recognizing: true });
}
function onSpeechResults(e) {
  const { startTime, results } = this.state;
  const { clips } = this.props;
  try {
    const duration = clips.reduce(
      (a, b) => a.finalDuration + b.finalDuration,
      0
    );
    currentResults = results && results.length > 0 ? results : [];
    const words = e.value[e.value.length - 1];
    const mostRecentWord = words[words.length - 1];
    this.mounted &&
      this.setState({
        results: [
          ...currentResults,
          {
            word: mostRecentWord,
            time: Date.now() - startTime + duration,
          },
        ],
      });
  } catch (err) {
    console.log("speech recognition", err);
  }
}
export {
  storeData,
  getData,
  removeItemValue,
  clearAsyncStorage,
  playSound,
  soundBlobToBase64,
  duplicateCommentsString,
  duplicateNotifsString,
  onSpeechResults,
  onSpeechStart,
};
