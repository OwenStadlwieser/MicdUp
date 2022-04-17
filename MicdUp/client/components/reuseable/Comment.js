import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
// components
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Platform,
  TouchableHighlight,
  Image,
  ScrollView,
  Dimensions,
} from "react-native";
import Like from "./Like";
import SpeechToText from "./SpeechToText";
import CircleSnail from "react-native-progress/CircleSnail";
// styles
import { styles } from "../../styles/Styles";
// helpers
import { soundBlobToBase64 } from "../../reuseableFunctions/helpers";
import {
  startRecording,
  stopRecording,
} from "../../reuseableFunctions/recording";
// audio
import {
  onSpeechResults,
  onSpeechStart,
} from "../../reuseableFunctions/helpers";
import Voice from "@react-native-voice/voice";
// icons
import { FontAwesome5 } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
// redux
import { changeSound, pauseSound } from "../../redux/actions/sound";
import { commentPost, getComments } from "../../redux/actions/recording";
import {
  getReplies,
  updateCommentDisplay,
  updateComments,
  deleteComment,
} from "../../redux/actions/comment";
import { hideComments } from "../../redux/actions/display";

const { height } = Dimensions.get("window");
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
      replyingToName: "",
      parents: null,
    };
    try {
      Voice.onSpeechResults = onSpeechResults.bind(this);
      Voice.onSpeechStart = onSpeechStart.bind(this);
    } catch (err) {
      console.log(err);
    }
    this.colors = ["white", "red"];
    this.mounted = true;
  }

  onSpeechStart = () => {
    this.mounted && this.setState({ recognizing: true });
  };
  onSpeechResults = (e) => {
    this.mounted && this.setState({ results: e.value });
  };

  componentWillUnmount = async () => {
    await this.stopRecordingComment();
    this.mounted = false;
  };

  componentDidMount = async () => {
    const { post } = this.props;
    this.mounted && this.setState({ loading: true });
    await this.props.getComments(post);
    this.mounted && this.setState({ loading: false });
    setInterval(() => {
      const { v } = this.state;
      this.mounted &&
        this.state.recording &&
        this.setState({ v: v === 1 ? 0 : v + 1 });
    }, 1000);
  };

  startRecordingComment = async () => {
    const recording = await startRecording(Voice, () => {});
    this.mounted && this.setState({ recording, startTime: Date.now() });
  };

  stopRecordingComment = async () => {
    const { recording, results } = this.state;
    console.log("Stopping recording..");
    if (!recording) {
      Platform.OS !== "web" && Voice.stop();
      return;
    }
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
  };

  handleMap(comment, i, index, parentId, parent) {
    const { profile, post, playingId, isPause } = this.props;
    console.log(comment, post);
    if (comment.allReplies && comment.allReplies.length > 0) {
      comment.replies = comment.allReplies;
    }
    if (parentId && parent && parent.parents) {
      comment.parents = [...parent.parents, parentId];
    } else if (parent && !parent.parents) {
      comment.parents = [parentId];
    }
    return (
      <Fragment key={comment.id}>
        <View
          /*
        onHoldDown remove id from dictionary  
      */
          style={{
            paddingLeft: index > 0 && index < 12 ? index * 10 : 0,
            right: index >= 12 ? 10 : 0,
            borderLeftColor: "#1A3561",
            borderStyle: "solid",
            borderLeftWidth: 1,
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 5,
          }}
        >
          <TouchableOpacity
            onPress={async () => {
              if (playingId === comment.id && !isPause) {
                await this.props.pauseSound();
              } else if (comment.signedUrl) {
                await this.props.changeSound(comment, comment.signedUrl);
              }
            }}
            style={{
              paddingTop: height * 0.01,
              justifyContent: "space-evenly",
              paddingHorizontal: 15,
              borderLeftColor: "#1A3561",
              borderStyle: "solid",
              left: index >= 12 ? -1 : 0,
              borderLeftWidth: index >= 12 ? 0 : 1,
              zIndex: index >= 12 ? 1 : 0,
              flex: 9,
              backgroundColor:
                playingId === comment.id && !isPause && index >= 12
                  ? "#6FF6FF"
                  : index >= 12
                  ? "white"
                  : "transparent",
            }}
          >
            <View style={{ flexDirection: "column" }}>
              <View style={{ flex: 2 }}>
                <Text style={styles.blackText}>
                  @
                  {comment && comment.owner && comment.owner.user
                    ? comment.owner.user.userName
                    : ""}
                </Text>
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
              </View>
              <View
                style={{ flex: 7, position: "relative", overflow: "hidden" }}
              >
                {comment.speechToText && comment.speechToText[0] && (
                  <SpeechToText
                    containerStyle={[{ flexDirection: "row" }]}
                    fontSize={24}
                    post={comment}
                    textStyle={{}}
                  />
                )}
              </View>
            </View>
            <View
              style={{
                zIndex: index >= 12 ? 1 : 0,
                backgroundColor: index >= 12 ? "white" : "transparent",
                left: index >= 12 ? -1 : 0,
                flexDirection: "row",
                paddingTop: 5,
                flexWrap: "nowrap",
              }}
            >
              <TouchableHighlight
                onPress={async () => {
                  this.mounted &&
                    this.setState({
                      parents: comment.parents,
                      replyingTo: comment.id,
                      replyingToName: `@${comment.owner.user.userName}`,
                    });
                }}
                style={styles.replyActionsContainer}
              >
                <Text style={styles.replyActionsText}>Reply</Text>
              </TouchableHighlight>
              {index !== 0 && comment.repliesLength > 0 && (
                <TouchableHighlight
                  onPress={async () => {
                    const replies = await this.props.getReplies(comment.id);
                    /*
                  replies: Comment
                  replies.allReplies: [Comment]
                  add replies id and all its children to showing dictionary
                */
                    this.props.updateCommentDisplay(
                      replies,
                      comment.parents,
                      post
                    );
                  }}
                  style={styles.replyActionsContainer}
                >
                  <Text style={styles.replyActionsText}>Show more replies</Text>
                </TouchableHighlight>
              )}
            </View>
          </TouchableOpacity>
          {comment.signedUrl || comment.text ? (
            <View style={{ flex: 1, alignItems: "center", paddingRight: 10 }}>
              {comment.signedUrl && (
                <Like
                  post={comment}
                  type={"Comment"}
                  parents={comment.parents}
                  postId={post.id}
                  ownerId={post.owner.id}
                />
              )}
              {!comment.isDeleted &&
                ((profile && profile.id === post.owner.id) ||
                  (profile && comment.owner.id === profile.id)) && (
                  <Feather
                    onPress={async () => {
                      const newComment = await this.props.deleteComment(
                        comment.id
                      );
                      this.props.updateCommentDisplay(
                        newComment,
                        comment.parents,
                        post
                      );
                    }}
                    name="scissors"
                    size={24}
                    color="red"
                  />
                )}
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              <Text>{comment.isDeleted ? "Deleted" : comment.text}</Text>
            </View>
          )}
        </View>

        {
          /*
            check comment id is in showing dictionary
            parent.id isnt in dictionary parent.replies never get mapped
          */
          comment.replies &&
            comment.replies.length > 0 &&
            comment.replies.map((child, index2) => {
              return this.handleMap(child, i, index + 1, comment.id, comment);
            })
        }
      </Fragment>
    );
  }

  render() {
    const { post } = this.props;
    const {
      v,
      text,
      replyingTo,
      recording,
      audioBlobs,
      replyingToName,
      parents,
      loading,
    } = this.state;
    return (
      <View
        onStartShouldSetResponder={(event) => true}
        style={styles.commentOpenContainer}
      >
        <AntDesign
          style={[styles.topLeftIcon, { zIndex: 4 }]}
          name="leftcircle"
          size={24}
          color="#1A3561"
          onPress={() => {
            this.props.hideComments();
          }}
        />
        <View style={styles.commentsContainer}>
          {post.comments && post.comments.length > 0 ? (
            <ScrollView
              ref={(scrollView) => (this.scrollView = scrollView)}
              scrollEnabled={true}
            >
              {post.comments.map((comment, index) => {
                return this.handleMap(comment, index, 0, null, null);
              })}
            </ScrollView>
          ) : !loading ? (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{ color: "#1A3561", fontStyle: "italic", fontSize: 24 }}
              >
                Be the first to comment!
              </Text>
            </View>
          ) : (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {loading && (
                <CircleSnail color={["white", "#1A3561", "#6FF6FF"]} />
              )}
            </View>
          )}
        </View>
        <View style={styles.recordingContainerComments}>
          <TextInput
            value={replyingToName ? replyingToName : ""}
            onChangeText={(e) => {
              this.mounted && this.setState({ text });
            }}
            style={styles.textInputComments}
          ></TextInput>
          <View style={styles.iconContainerComments}>
            {!(!audioBlobs && !replyingTo && !text) && (
              <Feather
                style={styles.recordingMicIconComments}
                name="delete"
                size={24}
                color="black"
                onPress={() => {
                  this.mounted &&
                    this.setState({
                      audioBlobs: false,
                      replyingTo: "",
                      text: "",
                      replyingToName: "",
                      parents: null,
                    });
                }}
              />
            )}
            {!recording ? (
              <MaterialCommunityIcons
                onPress={this.startRecordingComment}
                name="microphone-plus"
                size={75}
                color="red"
                style={styles.recordingMicIconComments}
              />
            ) : (
              Platform.OS === "web" && (
                <FontAwesome5
                  onPress={this.stopRecordingComment}
                  style={styles.currentRecordingIconComments}
                  name="record-vinyl"
                  size={24}
                  color={this.colors[v]}
                />
              )
            )}
            <TouchableOpacity onPress={async () => {}}>
              <Entypo
                style={styles.recordingMicIconComments}
                name="emoji-happy"
                size={24}
                color="black"
              />
            </TouchableOpacity>
            {(text || audioBlobs) && (
              <TouchableOpacity
                onPress={async () => {
                  const { results } = this.state;
                  let fileType;
                  const base64Url = await soundBlobToBase64(audioBlobs.uri);
                  if (base64Url != null) {
                    fileType = audioBlobs.type;
                  } else {
                    console.log("error with blob");
                  }
                  await this.props.commentPost(
                    post,
                    replyingTo,
                    base64Url,
                    fileType,
                    text,
                    [JSON.stringify(results)],
                    parents
                  );
                }}
              >
                <FontAwesome name="send" size={24} color="black" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  profile: state.auth.user.profile,
  playingId:
    state.sound.currentPlayingSound && state.sound.currentPlayingSound.id,
  isPause: state.sound.isPause,
});

export default connect(mapStateToProps, {
  commentPost,
  getReplies,
  updateCommentDisplay,
  updateComments,
  deleteComment,
  hideComments,
  getComments,
  changeSound,
  pauseSound,
})(Comment);
