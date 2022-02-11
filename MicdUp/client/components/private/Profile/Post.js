import React, { Component } from "react";
import { connect } from "react-redux";
// components
import PlayButton from "../../reuseable/PlayButton";
import Like from "../../reuseable/Like";
import SpeechToText from "../../reuseable/SpeechToText";
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
// styles
import { FontAwesome } from "@expo/vector-icons";
import { styles } from "../../../styles/Styles";

//icons
import { Feather } from "@expo/vector-icons";
//redux
import { deletePost } from "../../../redux/actions/recording";
import { changeSound, pauseSound } from "../../../redux/actions/sound";
import { showComments } from "../../../redux/actions/display";

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
    const { post, index, isUserProfile, playingId, isPause } = this.props;
    return (
      <TouchableOpacity
        onPress={async () => {
          if (playingId === post.id && !isPause) {
            await this.props.pauseSound();
          } else {
            await this.props.changeSound(post, post.signedUrl);
          }
        }}
        style={styles.postContainer}
        key={post.id}
      >
        <View
          style={{
            justifyContent: "space-evenly",
            flex: 9,
            overflow: "hidden",
          }}
        >
          <Text
            style={[
              styles.postTitle,
              { flexWrap: "nowrap", paddingTop: 10, fontWeight: "700" },
            ]}
          >
            {post.title ? post.title : "Untitled"}
          </Text>
          <SpeechToText
            containerStyle={[
              { flexDirection: "row", flexWrap: "nowrap", flex: 1 },
            ]}
            fontSize={24}
            post={post}
            textStyle={{}}
          />
        </View>
        <View style={[styles.textAndPlayButtonContainer, { flex: 1 }]}>
          <View style={styles.postPlayButton}>
            <Like post={post} type={"Post"} />
            <TouchableOpacity
              onPress={() => {
                this.props.showComments(index);
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
  showComments,
})(Post);
