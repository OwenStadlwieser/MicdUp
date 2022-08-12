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
  ScrollView,
} from "react-native";
import { ScrollView as GestureHandlerScrollView } from "react-native-gesture-handler";
import ProgressBar from "../../reuseable/ProgressBar";
import DeleteableItem from "../../reuseable/DeleteableItem";
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
  searchViewTag,
} from "../../../redux/actions/display";
// helpers
import { forHumans, getCurrentTime } from "../../../reuseableFunctions/helpers";

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
      index,
      playingId,
      isPause,
      canViewPrivate,
      profile,
      postArray,
    } = this.props;
    return (
      <TouchableHighlight
        onPress={async () => {
          if (playingId === post.id && !isPause) {
            await this.props.pauseSound();
          } else if (post.signedUrl) {
            await this.props.changeSound(index, postArray);
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
                    this.props.viewProfile({
                      ...post.owner,
                    });
                    this.props.searchViewProfile(true);
                    this.mounted && this.setState({ showing: false });
                    this.props.navigate("SearchProfile");
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
              {post.tags && post.tags.length > 0 && (
                <GestureHandlerScrollView
                  horizontal={true}
                  onTouchEnd={() => {
                    this.props.setOuterScroll(true);
                  }}
                  onTouchStart={() => {
                    this.props.setOuterScroll(false);
                  }}
                >
                  <Fragment>
                    {post.tags.map((tag, index) => (
                      <DeleteableItem
                        item={tag}
                        style={{ margin: 3 }}
                        color={"white"}
                        title={"title"}
                        key={index}
                        onDelete={() => {
                          this.props.searchViewTag(tag);
                        }}
                        icon={"tag-multiple"}
                      />
                    ))}
                  </Fragment>
                </GestureHandlerScrollView>
              )}
            </View>
            <SpeechToText
              containerStyle={[
                { flexDirection: "row", flexWrap: "nowrap", flex: 1 },
              ]}
              fontSize={24}
              post={post}
              textStyle={{}}
            />
            <View
              style={{
                display: "flex",
                justifyContent: "space-between",
                flexDirection: "row",
              }}
            >
              <Text style={{ alignSelf: "flex-start", fontWeight: "700" }}>
                {forHumans(getCurrentTime() - post.dateCreated)} Ago
              </Text>
              <Text style={{ alignSelf: "flex-start", fontWeight: "700" }}>
                {forHumans(post.duration)}
              </Text>
            </View>
          </View>
          <View style={[styles.textAndPlayButtonContainer, { flex: 1 }]}>
            <View style={styles.postPlayButton}>
              {post.privatePost && canViewPrivate ? (
                <Entypo name="lock-open" size={24} color="black" />
              ) : (
                post.privatePost && (
                  <Entypo name="lock" size={48} color="black" />
                )
              )}
              {(!post.privatePost || (post.privatePost && canViewPrivate)) &&
                post.owner && (
                  <Fragment>
                    <Like
                      post={post}
                      type={"Post"}
                      postId={post.id}
                      ownerId={post.owner.id}
                      currentKey={this.props.currentKey}
                    />
                    <TouchableOpacity
                      onPress={() => {
                        this.props.showComments(index, this.props.currentKey);
                      }}
                    >
                      <FontAwesome name="comment" size={24} color="#000000" />
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
  searchViewTag,
})(Post);
