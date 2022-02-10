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
  Dimensions,
} from "react-native";
import Voice from "@react-native-voice/voice";
import AudioRecordingVisualization from "../../reuseable/AudioRecordingVisualization.native";
//icons
import { Fontisto } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SimpleLineIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
// styles
import { styles, largeIconFontSize } from "../../../styles/Styles";
// audio
import {
  onSpeechResultsClips,
  onSpeechStart,
} from "../../../reuseableFunctions/helpers";
import { startRecording } from "../../../reuseableFunctions/recording.native";
// clips
import Clips from "./Clips";
// redux
import { showMessage } from "../../../redux/actions/display";
import { updateClips, updateTags } from "../../../redux/actions/recording";
import { randomPrompt } from "../../../redux/actions/tag";
import { Button } from "react-native-paper";
const { width, height } = Dimensions.get("window");
const barWidth = 5;
const barMargin = 1;
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
      functionID: "",
      prompt: {},
      results: [],
    };
    try {
      Voice.onSpeechStart = onSpeechStart.bind(this);
      Voice.onSpeechEnd = () => {
        console.log("end");
      };
      Voice.onSpeechError = async (err) => {
        // console.log(err);
        Voice.stop();
      };
      Voice.onSpeechResults = onSpeechResultsClips.bind(this);
    } catch (err) {
      console.log(err);
    }
    this.mounted = true;
    this.colors = ["white", "red"];
  }
  componentWillUnmount = async () => {
    this.stopRecording();
    Voice.stop();
    this.mounted = false;
  };

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
    const recording = await startRecording(Voice, () => {});
    this.mounted && this.setState({ recording, startTime: Date.now() });
  };

  stopRecording = async () => {
    const { recording, results } = this.state;
    const { clips } = this.props;
    console.log("Stopping recording..");

    if (!recording || !recording.stopAndUnloadAsync) {
      return;
    }
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    try {
      console.log("stopping");
      Voice && Platform.OS !== "web" && Voice.stop();
    } catch (err) {
      console.log(err);
    }
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
                results,
                id: Date.now(),
              },
            ]
          : [
              {
                uri,
                finalDuration,
                type: Platform.OS === "web" ? "audio/webm" : ".m4a",
                results,
                id: Date.now(),
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
    const { recording, editRecording, submitRecording, promptShown, prompt } =
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
                      uri: user.profile.image.signedUrl,
                    }
                  : require("../../../assets/no-profile-pic-icon-27.jpg")
              }
              style={styles.profileImg}
            />
          </TouchableHighlight>
          <Text numberOfLines={1} style={[styles.whiteText, { width: 200 }]}>
            @{user ? user.userName : ""}
          </Text>
          {promptShown && (
            <View style={styles.promptTopic}>
              <TouchableOpacity
                style={styles.deletePromptButton}
                onPress={() => {
                  const { functionID } = this.state;
                  if (functionID) {
                    clearTimeout(functionID);
                  }
                  this.mounted &&
                    this.setState({
                      promptShown: false,
                      prompt: {},
                      functionID: 0,
                    });
                }}
                accessibilityLabel="Remove Prompt"
              >
                <AntDesign size={32} name="closecircleo" color="white" />
              </TouchableOpacity>
              <Text style={styles.promptText}>
                {prompt.prompt ? prompt.prompt : ""}
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
            {!recording && (
              <MaterialCommunityIcons
                onPress={this.startRecording}
                name="microphone-plus"
                size={75}
                color="red"
                style={styles.recordingMicIcon}
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
              onPress={async () => {
                let currentTag = "";
                const { functionID } = this.state;
                this.mounted && this.setState({ promptShown: true });
                if (functionID) {
                  clearTimeout(functionID);
                }
                const newPrompt = await this.props.randomPrompt();
                this.mounted && this.setState({ prompt: newPrompt });
                const newFunctionID = setTimeout(() => {
                  currentTag = this.props.tag + " " + newPrompt.tag.title + " ";
                  this.props.updateTags(currentTag);
                }, 10000);
                this.mounted && this.setState({ functionID: newFunctionID });
              }}
              style={styles.recordingHashtagIcon}
              name="hashtag"
              size={24}
              color="white"
            />
          </View>
        </View>
        {recording && (
          <AudioRecordingVisualization
            recording={recording}
            barWidth={barWidth}
            barMargin={barMargin}
          />
        )}
        {recording && (
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              fontSize: 50,
              position: "absolute",
              bottom: height * 0.08,
              width,
              left: 0,
              opacity: 1.0,
              zIndex: 6,
            }}
          >
            <FontAwesome5
              onPress={() => {
                this.stopRecording();
              }}
              style={{
                fontSize: largeIconFontSize,
                opacity: 1.0,
              }}
              name="record-vinyl"
              color={"red"}
            />
          </View>
        )}
      </View>
    );
    return app;
  }
}

const mapStateToProps = (state) => ({
  clips: state.recording.clips,
  user: state.auth.user,
  tag: state.recording.tags,
});

export default connect(mapStateToProps, {
  updateClips,
  updateTags,
  showMessage,
  randomPrompt,
})(Create);
