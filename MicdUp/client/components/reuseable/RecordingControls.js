import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import {
  View,
  Platform,
  TouchableOpacity,
  Text,
  Dimensions,
} from "react-native";
// children
import AudioRecordingVisualization from "./AudioRecordingVisualization";
// icons
import { FontAwesome5 } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
// helpers
import { soundBlobToBase64 } from "../../reuseableFunctions/helpers";
import {
  startRecording,
  stopRecording,
} from "../../reuseableFunctions/recording";
// styles
import { styles, largeIconFontSize } from "../../styles/Styles";
// redux
import {
  addLoading,
  removeLoading,
  showMessage,
} from "../../redux/actions/display";
import { changeSound, pauseSound } from "../../redux/actions/sound";
// audio
import Voice from "@react-native-voice/voice";

const { width, height } = Dimensions.get("window");
const barWidth = 5;
const barMargin = 1;

export class RecordingControls extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      audioBlobs: false,
      recording: false,
      v: 0,
    };
    this.colors = ["white", "red"];
    this.mounted = true;
  }

  componentWillUnmount = async () => {
    this.props.removeLoading("CONTROLS");
    await this.stopRecording();
    this.mounted = false;
  };

  componentDidMount = () => {
    setInterval(() => {
      const { v } = this.state;
      this.mounted &&
        this.state.recording &&
        this.setState({ v: v === 1 ? 0 : v + 1 });
    }, 1000);
  };

  startRecordingChat = async () => {
    this.props.addLoading("CONTROLS");
    this.props.onRecordingStart();
    try {
      const recording = await startRecording(Voice, () => {});
      this.mounted && this.setState({ recording, startTime: Date.now() });
    } catch (err) {
      this.props.showMessage({
        success: false,
        message: "Unable to start recording",
      });
    }
    this.props.removeLoading("CONTROLS");
  };

  stopRecording = async () => {
    const { recording, results } = this.state;
    if (!recording) {
      return;
    }
    this.props.addLoading("CONTROLS");
    let uri;
    if (Platform.OS !== "web") {
      uri = await stopRecording(recording, Voice);
    } else {
      uri = await stopRecording(recording);
    }
    const finalDuration = recording._finalDurationMillis;
    this.mounted &&
      this.setState({
        recording: false,
        audioBlobs: {
          uri,
          finalDuration,
          results,
          type: Platform.OS === "web" ? "audio/webm" : ".m4a",
        },
      });
    this.props.removeLoading("CONTROLS");
    console.log("Recording stopped and stored at", uri);
  };

  render() {
    const { audioBlobs, recording, v } = this.state;
    const { playingUri, isPause, replyingToName } = this.props;
    return (
      <Fragment>
        <View style={styles.recordingContainerComments}>
          {replyingToName ? (
            <Text style={{ position: "absolute", left: 0, top: 0 }}>
              {`Reply to ${replyingToName}`}
            </Text>
          ) : (
            <Fragment />
          )}
          <View style={styles.iconContainerComments}>
            {audioBlobs || replyingToName ? (
              <TouchableOpacity
                onPress={() => {
                  this.props.backButtonAction();
                  this.mounted &&
                    this.setState({
                      audioBlobs: false,
                    });
                }}
              >
                <Feather
                  style={styles.recordingMicIconComments}
                  name="delete"
                  size={24}
                  color="black"
                />
              </TouchableOpacity>
            ) : (
              <Fragment />
            )}
            {audioBlobs ? (
              playingUri === audioBlobs.uri && !isPause ? (
                <TouchableOpacity
                  onPress={async () => {
                    this.props.addLoading("CONTROLS");
                    await this.props.pauseSound();
                    this.props.removeLoading("CONTROLS");
                  }}
                >
                  <MaterialCommunityIcons
                    name="pause-circle"
                    size={75}
                    color="#6FF6FF"
                    style={styles.recordingMicIconComments}
                  />{" "}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={async () => {
                    this.props.addLoading("CONTROLS");
                    await this.props.changeSound(0, [
                      { ...audioBlobs, signedUrl: audioBlobs.uri },
                    ]);
                    this.props.removeLoading("CONTROLS");
                  }}
                >
                  <MaterialCommunityIcons
                    name="play-circle"
                    size={75}
                    color="#6FF6FF"
                    style={styles.recordingMicIconComments}
                  />
                </TouchableOpacity>
              )
            ) : !recording ? (
              <TouchableOpacity onPress={this.startRecordingChat}>
                <MaterialCommunityIcons
                  name="microphone-plus"
                  size={75}
                  color="red"
                  style={styles.recordingMicIconComments}
                />
              </TouchableOpacity>
            ) : (
              recording &&
              Platform.OS === "web" && (
                <TouchableOpacity onPress={this.stopRecording}>
                  <FontAwesome5
                    style={styles.recordingMicIconComments}
                    name="record-vinyl"
                    size={24}
                    color={this.colors[v]}
                  />
                </TouchableOpacity>
              )
            )}
            {audioBlobs && (
              <TouchableOpacity
                onPress={async () => {
                  let fileType;
                  const { results } = this.state;
                  const base64Url = await soundBlobToBase64(audioBlobs.uri);
                  if (base64Url != null) {
                    fileType = audioBlobs.type;
                    this.props.onSend(base64Url, fileType, results);
                  } else {
                    console.log("error with blob");
                  }
                  //  send message
                }}
              >
                <FontAwesome name="send" size={24} color="black" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        {recording && Platform.OS !== "web" && (
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
              zIndex: 51,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                this.stopRecording();
              }}
            >
              <FontAwesome5
                style={{
                  fontSize: largeIconFontSize,
                  opacity: 1.0,
                }}
                name="record-vinyl"
                color={"red"}
              />
            </TouchableOpacity>
          </View>
        )}
        {recording && Platform.OS !== "web" && (
          <AudioRecordingVisualization
            recording={recording}
            barWidth={barWidth}
            barMargin={barMargin}
          />
        )}
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  playingUri:
    state.sound.currentPlayingSound &&
    state.sound.currentPlayingSound.signedUrl,
  isPause: state.sound.isPause,
});

export default connect(mapStateToProps, {
  changeSound,
  pauseSound,
  addLoading,
  removeLoading,
  showMessage,
})(RecordingControls);
