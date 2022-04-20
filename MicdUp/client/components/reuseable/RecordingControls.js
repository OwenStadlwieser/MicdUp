import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { View, Platform, TouchableOpacity, Text } from "react-native";
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
import { styles } from "../../styles/Styles";
// redux
import { addLoading, removeLoading } from "../../redux/actions/display";
import { changeSound, pauseSound } from "../../redux/actions/sound";
// audio
import Voice from "@react-native-voice/voice";

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
    if (Platform.OS !== "web") {
      const recording = await startRecording(Voice, () => {});
      this.mounted && this.setState({ recording, startTime: Date.now() });
    } else {
      const recording = await startRecording(Voice, () => {});
      this.mounted && this.setState({ recording, startTime: Date.now() });
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
            <Feather
              style={styles.recordingMicIconComments}
              name="delete"
              size={24}
              color="black"
              onPress={() => {
                this.props.backButtonAction();
                this.mounted &&
                  this.setState({
                    audioBlobs: false,
                  });
              }}
            />
          ) : (
            <Fragment />
          )}
          {audioBlobs ? (
            playingUri === audioBlobs.uri && !isPause ? (
              <MaterialCommunityIcons
                onPress={async () => {
                  this.props.addLoading("CONTROLS");
                  await this.props.pauseSound();
                  this.props.removeLoading("CONTROLS");
                }}
                name="pause-circle"
                size={75}
                color="#6FF6FF"
                style={styles.recordingMicIconComments}
              />
            ) : (
              <MaterialCommunityIcons
                onPress={async () => {
                  this.props.addLoading("CONTROLS");
                  await this.props.changeSound(audioBlobs, audioBlobs.uri);
                  this.props.removeLoading("CONTROLS");
                }}
                name="play-circle"
                size={75}
                color="#6FF6FF"
                style={styles.recordingMicIconComments}
              />
            )
          ) : !recording ? (
            <MaterialCommunityIcons
              onPress={this.startRecordingChat}
              name="microphone-plus"
              size={75}
              color="red"
              style={styles.recordingMicIconComments}
            />
          ) : (
            recording &&
            Platform.OS === "web" && (
              <FontAwesome5
                onPress={this.stopRecording}
                style={styles.currentRecordingIconComments}
                name="record-vinyl"
                size={24}
                color={this.colors[v]}
              />
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
    );
  }
}

const mapStateToProps = (state) => ({
  playingUri:
    state.sound.currentPlayingSound && state.sound.currentPlayingSound.uri,
  isPause: state.sound.isPause,
});

export default connect(mapStateToProps, {
  changeSound,
  pauseSound,
  addLoading,
  removeLoading,
})(RecordingControls);
