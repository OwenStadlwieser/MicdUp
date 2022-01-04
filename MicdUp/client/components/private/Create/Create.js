import React, { Component } from "react";
import { connect } from "react-redux";
// components
import EditRecording from "./EditRecording";
import SubmitRecording from "./SubmitRecording";
import {
  Text,
  View,
  Image,
  TouchableHighlight,
  TouchableOpacity,
  Platform,
} from "react-native";
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
// clips
import Clips from "./Clips";
// redux
import { showMessage } from "../../../redux/actions/display";
import { updateClips } from "../../../redux/actions/recording";
import { Button } from "react-native-paper";

export class Create extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      recording: false,
      audioBlobs: [],
      v: 0,
      editRecording: false,
      submitRecording: false,
      promptShown: false,
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

  updateSubmitRecording = (submitRecording) => {
    this.mounted && this.setState({ submitRecording });
  };

  startRecording = async () => {
    try {
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
      console.log(recording);
      this.mounted && this.setState({ recording });
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  stopRecording = async () => {
    const { recording } = this.state;
    const { clips } = this.props;
    console.log("Stopping recording..");
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    const finalDuration = recording._finalDurationMillis;
    this.mounted &&
      this.setState({
        recording: false,
        audioBlobs: clips
          ? [
              ...clips,
              {
                uri,
                finalDuration,
                type: Platform.OS === "web" ? "audio/webm" : ".m4a",
              },
            ]
          : [
              {
                uri,
                finalDuration,
                type: Platform.OS === "web" ? "audio/webm" : ".m4a",
              },
            ],
        v: 0,
      });
    this.props.updateClips(this.state.audioBlobs);
    console.log("Recording stopped and stored at", uri);
  };

  hideEditRecording = () => {
    this.mounted && this.setState({ editRecording: false });
  };
  render() {
    const { user } = this.props;
    const { recording, clips, v, editRecording, submitRecording, promptShown } =
      this.state;
    const app = submitRecording ? (
      <SubmitRecording
        updateSubmitRecording={this.updateSubmitRecording.bind(this)}
      />
    ) : editRecording ? (
      <EditRecording
        updateSubmitRecording={this.updateSubmitRecording.bind(this)}
        hideEditRecording={this.hideEditRecording.bind(this)}
      />
    ) : (
      <View style={styles.pane}>
        <View style={styles.recordingPeopleContainer}>
          <TouchableHighlight
            style={[
              styles.profileImgContainer,
              { borderColor: recording ? "red" : "#30F3FF", borderWidth: 1 },
            ]}
          >
            <Image
              source={
                user && user.profile && user.profile.image
                  ? {
                      uri: user.profile.image,
                    }
                  : require("../../../assets/no-profile-pic-icon-27.jpg")
              }
              style={styles.profileImg}
            />
          </TouchableHighlight>
          <Text style={styles.whiteText}>@{user ? user.userName : ""}</Text>
          {promptShown && (
            <View style={styles.promptTopic}>
              <TouchableOpacity
                style={styles.deletePromptButton}
                onPress={() => {
                  this.mounted && this.setState({ promptShown: false });
                }}
                accessibilityLabel="Remove Prompt"
              >
                <AntDesign size={32} name="closecircleo" color="white" />
              </TouchableOpacity>
              <Text style={styles.promptText}>
                Some Prompt, what happens if the prompt is longer?
              </Text>
            </View>
          )}
        </View>
        <View style={styles.recordingClipsContainer}>
          <Clips />
        </View>
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
            <TouchableOpacity
              onPress={async () => {
                if (recording) {
                  await this.stopRecording();
                }
                const currentClips = this.props.clips;
                if (!currentClips || currentClips.length === 0) {
                  this.props.showMessage({
                    success: false,
                    message: "Record a clip before continuing",
                  });
                  return;
                }
                this.mounted && this.setState({ editRecording: true });
              }}
            >
              <AntDesign
                style={styles.recordingCircleIcon}
                name="rightcircle"
                size={48}
                color="white"
              />
            </TouchableOpacity>
          </View>
          <View style={styles.iconSmallContainer}>
            <Fontisto
              onPress={() => {
                this.mounted && this.setState({ promptShown: true });
              }}
              style={styles.recordingHashtagIcon}
              name="hashtag"
              size={24}
              color="white"
            />
          </View>
        </View>
      </View>
    );
    return app;
  }
}

const mapStateToProps = (state) => ({
  clips: state.recording.clips,
  user: state.auth.user,
});

export default connect(mapStateToProps, { updateClips, showMessage })(Create);
