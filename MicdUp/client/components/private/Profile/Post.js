import React, { Component } from "react";
import { connect } from "react-redux";
// components
import PlayButton from "../../reuseable/PlayButton";
import Like from "../../reuseable/Like";
import Comment from "../../reuseable/Comment";
import { View, Text, TouchableOpacity } from "react-native";
// styles
import { FontAwesome } from "@expo/vector-icons";
import { styles } from "../../../styles/Styles";

//icons
import { Feather } from "@expo/vector-icons";
//redux
import { deletePost } from "../../../redux/actions/recording";
import { changeSound, pauseSound } from "../../../redux/actions/sound";
import SpeechToText from "../../reuseable/SpeechToText";
export class Post extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      playbackObject: {},
      commentsShowing: false,
    };
    this.mounted = true;
  }

  setCommentsShowing = (commentsShowing) => {
    this.mounted && this.setState({ commentsShowing });
  };
  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = () => {};

  render() {
    const {
      post,
      currentSound,
      setCommentPosts,
      removeCommentPosts,
      index,
      isUserProfile,
      playingId,
      isPause,
      isRecordingComment,
    } = this.props;
    const { commentsShowing } = this.state;
    return (
      <TouchableOpacity
        onPress={async () => {
          if (playingId === post.id && !isPause) {
            await this.props.pauseSound();
          } else {
            await this.props.changeSound(post, post.signedUrl);
          }
        }}
        style={
          commentsShowing ? styles.higherPostContainer : styles.postContainer
        }
        key={post.id}
      >
        <Text style={styles.postTitle}>
          {post.title ? post.title : "Untitled"}
        </Text>
        <SpeechToText
          containerStyle={[
            { flexDirection: "row" },
            { position: "absolute" },
            { left: 20 },
            { top: 40 },
          ]}
          fontSize={24}
          post={post}
          textStyle={{}}
        />
        <Comment
          isUserProfile={isUserProfile}
          containerStyle={{}}
          setCommentPosts={setCommentPosts}
          removeCommentPosts={removeCommentPosts}
          color={"#1A3561"}
          currentPlayingId={currentSound}
          post={post}
          isShowing={commentsShowing}
          setCommentsShowing={this.setCommentsShowing.bind(this)}
          index={index}
          setRecording={this.props.setRecording}
          isRecordingComment={isRecordingComment}
        />
        <View style={styles.textAndPlayButtonContainer}>
          <View style={styles.postPlayButton}>
            <Like post={post} type={"Post"} />
            <TouchableOpacity
              onPress={() => {
                setCommentPosts(post, index);
                this.mounted && this.setState({ commentsShowing: true });
              }}
            >
              <FontAwesome name="comment" size={24} color="black" />
            </TouchableOpacity>
            <PlayButton containerStyle={{}} color={"#1A3561"} post={post} />
            {isUserProfile && (
              <Feather
                onPress={async () => {
                  await this.props.deletePost(post.id);
                }}
                name="scissors"
                size={24}
                color="red"
              />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

const mapStateToProps = (state) => ({
  posts: state.recording.posts,
  playingId:
    state.sound.currentPlayingSound && state.sound.currentPlayingSound.id,
  isPause: state.sound.isPause,
});

export default connect(mapStateToProps, {
  deletePost,
  changeSound,
  pauseSound,
})(Post);
