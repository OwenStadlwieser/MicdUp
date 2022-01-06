import React, { Component } from "react";
import { connect } from "react-redux";
// components
import {
  View,
  KeyboardAvoidingView,
  TextInput,
  TouchableOpacity,
  Platform,
  TouchableHighlight,
  Image,
  ScrollView,
} from "react-native";
import PlayButton from "./PlayButton";
// styles
import { styles } from "../../styles/Styles";
// helpers
import { soundBlobToBase64 } from "../../reuseableFunctions/helpers";
import onClickOutside from "react-onclickoutside";
// audio
import { Audio } from "expo-av";
// icons
import { FontAwesome5 } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
// redux
import { commentPost } from "../../redux/actions/recording";

export class Comment extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      isShowing: false,
      audioBlobs: false,
      recording: false,
      v: 0,
      text: "",
      replyingTo: "",
    };
    this.colors = ["white", "red"];
    this.mounted = true;
  }

  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = () => {
    const interval = setInterval(() => {
      const { v } = this.state;
      this.mounted &&
        this.state.recording &&
        this.setState({ v: v === 1 ? 0 : v + 1 });
    }, 1000);
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
    const finalDuration = recording._finalDurationMillis;
    this.mounted &&
      this.setState({
        recording: false,
        audioBlobs: {
          uri,
          finalDuration,
          type: Platform.OS === "web" ? "audio/webm" : ".m4a",
        },
      });
    console.log("Recording stopped and stored at", uri);
  };

  handleClickOutside = (evt) => {
    this.props.removeCommentPosts();
    this.props.setCommentsShowing(false);
    this.mounted && this.setState({ isShowing: false });
  };

  render() {
    const { post, isShowing } = this.props;
    const { v, text, replyingTo, recording, audioBlobs } = this.state;
    return (
      isShowing && (
        <KeyboardAvoidingView
          onStartShouldSetResponder={(event) => true}
          onTouchStart={(e) => {
            e.stopPropagation();
          }}
          style={styles.commentOpenContainer}
        >
          <ScrollView
            ref={(scrollView) => (this.scrollView = scrollView)}
            scrollEnabled={true}
            style={styles.commentsContainer}
          >
            {post.comments &&
              post.comments.map((comment, index) => (
                <View style={styles.commentContainer} key={comment.id}>
                  <TouchableHighlight
                    style={[
                      styles.commentImgContainer,
                      {
                        borderColor: "#30F3FF",
                        borderWidth: 1,
                      },
                    ]}
                  >
                    <Image
                      source={
                        comment && comment.owner && comment.owner.image
                          ? {
                              uri: comment.owner.image.signedUrl,
                            }
                          : require("../../assets/no-profile-pic-icon-27.jpg")
                      }
                      style={styles.commentImg}
                    />
                  </TouchableHighlight>
                  {comment.signedUrl ? (
                    <View style={styles.commentPlayContainer}>
                      <PlayButton
                        containerStyle={{}}
                        color={"#1A3561"}
                        currentPlayingId={this.props.currentPlayingId}
                        size={48}
                        post={comment}
                        setPlaying={this.props.setPlaying}
                        onPlaybackStatusUpdate={
                          this.props.onPlaybackStatusUpdate
                        }
                      />
                    </View>
                  ) : (
                    <View style={styles.commentTextContainer}>
                      <Text>{comment.text}</Text>
                    </View>
                  )}
                </View>
              ))}
          </ScrollView>
          <View style={styles.recordingContainerComments}>
            <TextInput
              value={text}
              onChangeText={(e) => {
                this.mounted && this.setState({ text });
              }}
              style={styles.textInputComments}
            ></TextInput>
            <View style={styles.iconContainerComments}>
              {audioBlobs && (
                <Feather
                  style={styles.recordingMicIconComments}
                  name="delete"
                  size={24}
                  color="black"
                  onPress={() => {
                    this.mounted && this.setState({ audioBlobs: false });
                  }}
                />
              )}
              {!recording ? (
                <MaterialCommunityIcons
                  onPress={this.startRecording}
                  name="microphone-plus"
                  size={75}
                  color="red"
                  style={styles.recordingMicIconComments}
                />
              ) : (
                <FontAwesome5
                  onPress={this.stopRecording}
                  style={styles.currentRecordingIconComments}
                  name="record-vinyl"
                  size={24}
                  color={this.colors[v]}
                />
              )}
              <TouchableOpacity onPress={async () => {}}>
                <Entypo
                  style={styles.recordingMicIconComments}
                  name="emoji-happy"
                  size={24}
                  color="black"
                />
              </TouchableOpacity>
              {text ||
                (audioBlobs && (
                  <TouchableOpacity
                    onPress={async () => {
                      let fileType;
                      const base64Url = await soundBlobToBase64(audioBlobs.uri);
                      if (base64Url != null) {
                        fileType = audioBlobs.type;
                      } else {
                        console.log("error with blob");
                      }
                      const res = await this.props.commentPost(
                        post.id,
                        replyingTo,
                        base64Url,
                        fileType,
                        text
                      );
                      console.log(res);
                    }}
                  >
                    <FontAwesome name="send" size={24} color="black" />
                  </TouchableOpacity>
                ))}
            </View>
          </View>
        </KeyboardAvoidingView>
      )
    );
  }
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, { commentPost })(
  onClickOutside(Comment)
);
