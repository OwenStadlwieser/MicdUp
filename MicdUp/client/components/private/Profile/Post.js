import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
// components
import Like from "../../reuseable/Like";
import SpeechToText from "../../reuseable/SpeechToText";
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TouchableHighlight,
} from "react-native";
import ProgressBar from "../../reuseable/ProgressBar";
// styles
import { FontAwesome } from "@expo/vector-icons";
import { styles, postWidth, postHeight } from "../../../styles/Styles";
//icons
import { Feather } from "@expo/vector-icons";
//redux
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
      <TouchableHighlight
        onPress={async () => {
          if (playingId === post.id && !isPause) {
            await this.props.pauseSound();
          } else {
            await this.props.changeSound(post, post.signedUrl);
          }
        }}
        style={[
          styles.postContainer,
          {
            backgroundColor: "white",
          },
        ]}
        key={post.id}
        underlayColor="#6FF6FF"
      >
        <Fragment>
          {playingId === post.id && <ProgressBar parentId={post.id} />}
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
                <FontAwesome name="comment" size={24} color="#1A3561" />
              </TouchableOpacity>
            </View>
          </View>
        </Fragment>
      </TouchableHighlight>
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
  changeSound,
  pauseSound,
  showComments,
})(Post);
