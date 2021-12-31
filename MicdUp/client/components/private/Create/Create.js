import React, { Component } from "react";
import { connect } from "react-redux";
import { Text, View } from "react-native";
//icons
import { MaterialCommunityIcons } from "@expo/vector-icons";
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
    };

    this.mounted = true;
  }

  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = () => {};

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
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
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
    const { recording, audioBlobs } = this.state;
    return (
      <View style={(styles.pane, styles.centeredFlexBox)}>
        <MaterialCommunityIcons
          onPress={recording ? this.stopRecording : this.startRecording}
          name="microphone-plus"
          size={24}
          color="red"
        />
        {audioBlobs.length > 0 && (
          <Text onPress={this.playSound}>Play Sound</Text>
        )}
      </View>
    );
  }
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, {})(Create);
