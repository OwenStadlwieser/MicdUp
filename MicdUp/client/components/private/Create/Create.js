import React, { Component } from "react";
import { connect } from "react-redux";
import { Text, View } from "react-native";
//icons
import { Fontisto } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SimpleLineIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
// styles
import { styles } from "../../../styles/Styles";
// audio
import { Audio } from "expo-av";

export class Create extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      recording: false,
      audioBlobs: [],
      v: 0,
    };

    this.mounted = true;
    this.colors = ["white", "red"];
  }
  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = async () => {
    const interval = setInterval(() => {
      const { v } = this.state;
      this.mounted &&
        this.state.recording &&
        this.setState({ v: v === 1 ? 0 : v + 1 });
    }, 1000);
  };
  onRecordingStatusUpdate = (param) => {
    console.log(param, 1);
  };
  startRecording = async () => {
    const { recording } = this.state;
    try {
      console.log("Requesting permissions..");
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      console.log("Starting recording..");
      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY,
        this.onRecordingStatusUpdate
      );
      this.mounted && this.setState({ recording });
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  stopRecording = async () => {
    const { recording } = this.state;
    console.log("Stopping recording..");
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    this.mounted &&
      this.setState({
        recording: false,
        audioBlobs: [...this.state.audioBlobs, uri],
        v: 0,
      });
    console.log("Recording stopped and stored at", uri);
  };

  playSound = async () => {
    const { audioBlobs } = this.state;
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      allowsRecordingIOS: false,
    });
    const playbackObject = new Audio.Sound();
    // OR
    const res = await Audio.Sound.createAsync(
      { uri: audioBlobs[0] },
      { shouldPlay: true }
    );
  };
  render() {
    const { recording, audioBlobs, v } = this.state;
    return (
      <View style={styles.pane}>
        <View style={styles.recordingPeopleContainer}></View>
        <View style={styles.recordingClipsContainer}></View>
        <View style={styles.recordingIconsContainer}>
          <View style={styles.iconSmallContainer}>
            <SimpleLineIcons
              style={styles.recordingFireIcon}
              name="fire"
              size={24}
              color="white"
            />
          </View>
          <View style={styles.iconContainer}>
            {!recording ? (
              <MaterialCommunityIcons
                onPress={this.startRecording}
                name="microphone-plus"
                size={75}
                color="red"
                style={styles.recordingMicIcon}
              />
            ) : (
              <FontAwesome5
                onPress={this.stopRecording}
                style={styles.currentRecordingIcon}
                name="record-vinyl"
                size={24}
                color={this.colors[v]}
              />
            )}

            <AntDesign
              style={styles.recordingCircleIcon}
              name="rightcircle"
              size={48}
              color="white"
            />
          </View>
          <View style={styles.iconSmallContainer}>
            <Fontisto
              style={styles.recordingHashtagIcon}
              name="hashtag"
              size={24}
              color="white"
            />
          </View>
        </View>
        {audioBlobs.length > 0 && (
          <Text onPress={this.playSound}>Play Sound</Text>
        )}
      </View>
    );
  }
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, {})(Create);
