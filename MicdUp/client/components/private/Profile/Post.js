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
  Image,
} from "react-native";
import ProgressBar from "../../reuseable/ProgressBar";
// styles
import { styles, postWidth, postHeight } from "../../../styles/Styles";
//icons
import { FontAwesome } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
//redux
import { changeSound, pauseSound } from "../../../redux/actions/sound";
import {
  showComments,
  viewProfile,
  searchViewProfile,
  navigate,
} from "../../../redux/actions/display";

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
    const { post, index, playingId, isPause, canViewPrivate, profile } =
      this.props;
    return (
      <TouchableHighlight
        onPress={async () => {
          if (playingId === post.id && !isPause) {
            await this.props.pauseSound();
          } else if (post.signedUrl) {
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
          {post.privatePost && canViewPrivate ? (
            <Entypo
              name="lock-open"
              size={24}
              color="black"
              style={{ position: "absolute", top: 0, left: 0 }}
            />
          ) : (
            post.privatePost && (
              <Entypo
                name="lock"
                size={24}
                color="black"
                style={{ position: "absolute", top: 0, left: 0 }}
              />
            )
          )}
          {playingId === post.id && (
            <ProgressBar
              height={postHeight}
              width={postWidth}
              parentId={post.id}
            />
          )}
          <View
            style={{
              justifyContent: "space-evenly",
              flex: 9,
              overflow: "hidden",
            }}
          >
            <View>
              {post.owner && (
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    alignItems: "center",
                  }}
                  onPress={() => {
                    if (profile && profile.id === post.owner.id) {
                      this.props.navigate("Profile");
                      this.mounted && this.setState({ showing: false });
                      return;
                    }
                    this.props.navigate("Search");
                    this.props.viewProfile(post.owner);
                    this.props.searchViewProfile(true);
                    this.mounted && this.setState({ showing: false });
                  }}
                >
                  <Image
                    source={
                      post.owner.image
                        ? {
                            uri: post.owner.image.signedUrl,
                          }
                        : require("../../../assets/no-profile-pic-icon-27.jpg")
                    }
                    style={styles.listItemProfileImg}
                  />
                  <Text
                    style={[styles.listItemTextUser, { fontStyle: "italic" }]}
                  >
                    @{post.owner.user.userName}
                  </Text>
                </TouchableOpacity>
              )}
              <Text style={styles.postTitle}>
                {post.title ? post.title : "Untitled"}
              </Text>
            </View>
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
              {(!post.privatePost || (post.privatePost && canViewPrivate)) &&
                post.owner && (
                  <Fragment>
                    <Like
                      post={post}
                      type={"Post"}
                      postId={post.id}
                      ownerId={post.owner.id}
                    />
                    <TouchableOpacity
                      onPress={() => {
                        this.props.showComments(index);
                      }}
                    >
                      <FontAwesome name="comment" size={24} color="#1A3561" />
                    </TouchableOpacity>
                  </Fragment>
                )}
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
  profile: state.auth.user.profile,
});

export default connect(mapStateToProps, {
  changeSound,
  pauseSound,
  showComments,
  viewProfile,
  searchViewProfile,
  navigate,
})(Post);
