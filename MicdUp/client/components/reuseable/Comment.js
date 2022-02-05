import React, { Component } from "react";
import { connect } from "react-redux";
// components
import {
  View,
  KeyboardAvoidingView,
  TextInput,
  Text,
  TouchableOpacity,
  Platform,
  TouchableHighlight,
  Image,
  ScrollView,
  Dimensions,
} from "react-native";
import PlayButton from "./PlayButton";
import Like from "./Like";
// styles
import { styles } from "../../styles/Styles";
// helpers
import { soundBlobToBase64 } from "../../reuseableFunctions/helpers";
import onClickOutside from "react-onclickoutside";
import {
  startRecording,
  stopRecording,
} from "../../reuseableFunctions/recording";
// audio
import Voice from "@react-native-voice/voice";
// icons
import { FontAwesome5 } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
// redux
import { commentPost } from "../../redux/actions/recording";
import {
  getReplies,
  updateCommentDisplay,
  updateComments,
  deleteComment,
} from "../../redux/actions/comment";

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
      Voice.onSpeechResults = this.onSpeechResults.bind(this);
      Voice.onSpeechStart = this.onSpeechStart.bind(this);
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

  componentWillUnmount = () => {
    this.stopRecordingComment();
    this.mounted = false;
  };

  componentDidMount = () => {
    const interval = setInterval(() => {
      const { v } = this.state;
      this.mounted &&
        this.state.recording &&
        this.setState({ v: v === 1 ? 0 : v + 1 });
    }, 1000);
  };

  componentDidUpdate = async (prevProps) => {
    const { isRecordingComment } = this.props;
    if (!isRecordingComment && prevProps.isRecordingComment) {
      await this.stopRecordingComment();
    }
  };

  startRecordingComment = async () => {
    this.props.setRecording(true);
    const recording = await startRecording(Voice, () => {});
    this.mounted && this.setState({ recording });
  };

  stopRecordingComment = async () => {
    const { recording } = this.state;
    this.props.setRecording(false);
    console.log("Stopping recording..");
    if (!recording) {
      return;
    }
    const uri = await stopRecording(recording);
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
  };

  handleMap(comment, i, index, parentId, parent) {
    const { profile, post } = this.props;
    if (comment.allReplies && comment.allReplies.length > 0) {
      comment.replies = comment.allReplies;
    }
    if (parentId && parent && parent.parents) {
      comment.parents = [...parent.parents, parentId];
    } else if (parent && !parent.parents) {
      comment.parents = [parentId];
    }
    return (
      <View
        /*
        onHoldDown remove id from dictionary  
      */
        key={comment.id}
        style={{
          paddingLeft: index > 0 && index < 12 ? 10 : 0,
          right: index >= 12 ? 10 : 0,
          borderLeftColor: "#1A3561",
          borderStyle: "solid",
          borderLeftWidth: 1,
        }}
      >
        <View
          style={{
            paddingTop: height * 0.01,
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 15,
            flexDirection: "row",
            borderLeftColor: "#1A3561",
            borderStyle: "solid",
            left: index >= 12 ? -1 : 0,
            borderLeftWidth: index >= 12 ? 0 : 1,
            zIndex: index >= 12 ? 1 : 0,
            backgroundColor: index >= 12 ? "white" : "transparent",
          }}
        >
          <View>
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
          {comment.signedUrl || comment.text ? (
            <View style={styles.commentPlayContainer}>
              {comment.signedUrl && (
                <Like
                  post={comment}
                  type={"Comment"}
                  parents={comment.parents}
                  postId={this.props.post.id}
                />
              )}
              {comment.signedUrl && (
                <PlayButton
                  containerStyle={{}}
                  color={"#1A3561"}
                  size={48}
                  post={comment}
                />
              )}
              {!comment.isDeleted &&
                (profile.id === post.owner.id ||
                  comment.owner.id === profile.id) && (
                  <Feather
                    onPress={async () => {
                      const newComment = await this.props.deleteComment(
                        comment.id
                      );
                      this.props.updateCommentDisplay(
                        newComment,
                        comment.parents,
                        this.props.post.id
                      );
                    }}
                    name="scissors"
                    size={24}
                    color="red"
                  />
                )}
            </View>
          ) : (
            <View style={styles.commentTextContainer}>
              <Text>{comment.isDeleted ? "Deleted" : comment.text}</Text>
            </View>
          )}
        </View>
        <View
          style={{
            zIndex: index >= 12 ? 1 : 0,
            backgroundColor: index >= 12 ? "white" : "transparent",
            left: index >= 12 ? -1 : 0,
            flexDirection: "row",
            borderLeftColor: "#1A3561",
            borderStyle: "solid",
            borderLeftWidth: index >= 12 ? 0 : 1,
            paddingTop: 5,
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
                  this.props.post.id
                );
              }}
              style={styles.replyActionsContainer}
            >
              <Text style={styles.replyActionsText}>Show more replies</Text>
            </TouchableHighlight>
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
      </View>
    );
  }

  handleClickOutside = async (evt) => {
    await this.stopRecordingComment();
    this.props.removeCommentPosts();
    this.props.setCommentsShowing(false);
    this.mounted && this.setState({ isShowing: false });
  };

  render() {
    const { post, isShowing } = this.props;
    const {
      v,
      text,
      replyingTo,
      recording,
      audioBlobs,
      replyingToName,
      parents,
    } = this.state;
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
              post.comments.map((comment, index) => {
                return this.handleMap(comment, index, 0, null, null);
              })}
          </ScrollView>
          <View style={styles.recordingContainerComments}>
            <TextInput
              value={replyingToName + text}
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
                      text,
                      parents
                    );
                  }}
                >
                  <FontAwesome name="send" size={24} color="black" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      )
    );
  }
}

const mapStateToProps = (state) => ({
  profile: state.auth.user.profile,
});

export default connect(mapStateToProps, {
  commentPost,
  getReplies,
  updateCommentDisplay,
  updateComments,
  deleteComment,
})(onClickOutside(Comment));
