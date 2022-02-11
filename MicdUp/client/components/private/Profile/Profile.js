import React, { Component } from "react";
import { connect } from "react-redux";
import {
  TouchableOpacity,
  View,
  Image,
  Text,
  TouchableHighlight,
  Platform,
  ScrollView,
  Dimensions,
} from "react-native";
// icons
import { Ionicons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
// styles
import { styles, postHeight, largeIconFontSize } from "../../../styles/Styles";
// children
import Settings from "./Settings";
import Bio from "./Bio";
import Post from "./Post";
import ImagePicker from "../../reuseable/ImagePicker";
import AudioRecordingVisualization from "../../reuseable/AudioRecordingVisualization";
import Comment from "../../reuseable/Comment";
// redux
import { getUserPosts, getComments } from "../../../redux/actions/recording";
import {
  updateProfilePic,
  followProfile,
} from "../../../redux/actions/profile";
import { createOrOpenChat } from "../../../redux/actions/chat";
import GestureRecognizer from "react-native-swipe-gestures";
// audio
import {
  startRecording,
  stopRecording,
} from "../../../reuseableFunctions/recording";

var { height, width } = Dimensions.get("window");
const barWidth = 5;
const barMargin = 1;
export class Profile extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      settingsShown: false,
      recording: false,
      playbackObject: {},
      currentBioRecording: "",
      newBioRecording: {},
      selectImage: false,
      bio: false,
      isRecordingComment: false,
    };
    this.scrollView = null;
    this.mounted = true;
  }

  async handleScroll(event) {
    const { posts, getUserPosts, currentProfile } = this.props;
    const { loading } = this.state;
    try {
      if (
        event.nativeEvent.contentOffset.y > posts.length * postHeight &&
        !loading &&
        posts.length % 20 === 0
      ) {
        this.mounted && this.setState({ loading: true });
        await getUserPosts(currentProfile.id, posts.length / 20);
        this.mounted && this.setState({ loading: false });
      }
    } catch (err) {
      console.log(err);
    }
  }

  async onSwipeDown(gestureState) {
    const { getUserPosts, currentProfile } = this.props;
    if (this.state.loading) return;
    this.mounted && this.setState({ loading: true });
    await getUserPosts(currentProfile.id, 0);
    this.mounted && this.setState({ loading: false });
  }

  stopCurrentSound = async () => {
    const { playbackObject } = this.state;
    if (!playbackObject) return;
    try {
      await playbackObject.stopAsync();
    } catch (err) {}
    this.mounted && this.setState({ playing: "", playingId: "" });
  };

  startRecording = async () => {
    try {
      const recording = await startRecording(null, () => {});
      this.mounted && this.setState({ recording, bio: true });
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  stopRecordingBio = async () => {
    const { recording, results } = this.state;
    console.log("Stopping recording..");
    if (!recording) {
      return;
    }
    let uri;
    if (Platform.OS !== "web") {
      uri = await stopRecording(recording, null);
    } else {
      uri = await stopRecording(recording);
    }
    const finalDuration = recording._finalDurationMillis;
    this.mounted &&
      this.setState({
        recording: false,
        newBioRecording: {
          uri,
          finalDuration,
          results,
          type: Platform.OS === "web" ? "audio/webm" : ".m4a",
        },
      });
    console.log("Recording stopped and stored at", uri);
  };

  componentWillUnmount = async () => {
    await this.stopRecordingBio();
    this.mounted = false;
  };

  componentDidMount = async () => {
    const { getUserPosts, currentProfile, profile, posts } = this.props;
    if (
      ((profile && currentProfile && profile.id !== currentProfile.id) ||
        (!posts && profile) ||
        (posts.length === 0 && profile)) &&
      !this.state.loading
    ) {
      let id = currentProfile ? currentProfile.id : profile ? profile.id : null;
      if (!id) return;
      this.mounted && this.setState({ loading: true });
      await getUserPosts(id, 0);
      this.mounted && this.setState({ loading: false });
    }
  };

  componentDidUpdate = async (prevProps) => {
    const { getUserPosts, currentProfile, profile, posts } = this.props;

    if (
      !prevProps.profile &&
      ((profile && currentProfile && profile.id !== currentProfile.id) ||
        (!posts && profile) ||
        (posts.length === 0 && profile)) &&
      !this.state.loading
    ) {
      let id = currentProfile ? currentProfile.id : profile ? profile.id : null;
      if (!id) return;
      this.mounted && this.setState({ loading: true });
      await getUserPosts(id, 0);
      this.mounted && this.setState({ loading: false });
    }
  };

  hideSetting = () => {
    this.mounted && this.setState({ settingsShown: false });
  };

  setNewBioRecording = (newR) => {
    this.mounted && this.setState({ newBioRecording: newR });
  };

  setImage = (uri, base64) => {
    let mimeType2 = uri.match(/[^:/]\w+(?=;|,)/)[0];
    this.props.updateProfilePic(uri, base64, "." + mimeType2);
  };

  setHidden = () => {
    this.mounted && this.setState({ selectImage: false });
  };

  render() {
    const config = {
      velocityThreshold: 0.3,
      directionalOffsetThreshold: 80,
    };
    const {
      settingsShown,
      recording,
      newBioRecording,
      playingId,
      loading,
      selectImage,
      isRecordingComment,
    } = this.state;
    const {
      userName,
      profile,
      currentProfile,
      posts,
      postIndex,
      showingComments,
    } = this.props;
    if (!profile && !currentProfile) {
      return (
        <View>
          <Text>Loading</Text>
        </View>
      );
    }
    const isUserProfile =
      profile && currentProfile ? profile.id === currentProfile.id : true;
    console.log(postIndex, posts[postIndex]);
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: this.state.backgroundColor,
        }}
      >
        {selectImage && (
          <ImagePicker
            setHidden={this.setHidden.bind(this)}
            setImage={this.setImage.bind(this)}
          />
        )}
        {!settingsShown && isUserProfile && !showingComments && (
          <Ionicons
            onPress={() => {
              this.mounted && this.setState({ settingsShown: true });
            }}
            name="settings-outline"
            size={24}
            color="white"
            style={styles.topRightIcon}
          />
        )}
        {settingsShown && (
          <Settings hideSetting={this.hideSetting.bind(this)} />
        )}
        {!settingsShown && (
          <View style={styles.paneUncentered}>
            {loading && (
              <View style={styles.refresh}>
                <Text style={styles.nextButtonText}>Loading</Text>
              </View>
            )}
            {showingComments && (
              <Comment
                isUserProfile={isUserProfile}
                containerStyle={{}}
                color={"#1A3561"}
                currentPlayingId={playingId}
                post={posts[postIndex]}
                setRecording={((val) => {
                  this.mounted &&
                    this.setState({
                      recording: val,
                      isRecordingComment: true,
                    });
                }).bind(this)}
                isRecordingComment={isRecordingComment}
              />
            )}
            <GestureRecognizer
              onSwipeDown={(state) => this.onSwipeDown(state)}
              config={config}
            >
              <View style={styles.profileHeader}>
                <View style={styles.imageAndFollowing}>
                  <View style={styles.imageAndIcon}>
                    <TouchableHighlight
                      style={[
                        styles.profileImgContainerSmall,
                        {
                          borderColor: recording ? "red" : "#30F3FF",
                          borderWidth: 1,
                        },
                      ]}
                    >
                      <Image
                        source={
                          currentProfile && currentProfile.image
                            ? { uri: currentProfile.image.signedUrl }
                            : require("../../../assets/no-profile-pic-icon-27.jpg")
                        }
                        style={styles.profileImgSmall}
                      />
                    </TouchableHighlight>
                    {isUserProfile && (
                      <TouchableHighlight
                        onPress={() => {
                          this.mounted && this.setState({ selectImage: true });
                        }}
                      >
                        <Entypo
                          style={styles.uploadIcon}
                          name="upload"
                          size={24}
                          color="#30F3FF"
                        />
                      </TouchableHighlight>
                    )}
                  </View>
                  <Text style={styles.followersText}>
                    {currentProfile ? currentProfile.followersCount : 0}{" "}
                    Followers
                  </Text>
                </View>
                <Text numberOfLines={1} style={[styles.profileText]}>
                  @{userName}
                </Text>
                <Bio
                  startRecording={this.startRecording.bind(this)}
                  stopRecordingBio={this.stopRecordingBio.bind(this)}
                  currentSound={playingId}
                  setNewBioRecording={this.setNewBioRecording.bind(this)}
                  newBioRecording={newBioRecording}
                />
                {!isUserProfile && (
                  <View style={styles.foreignProfileButtons}>
                    <TouchableOpacity
                      onPress={async () => {
                        await this.props.followProfile(currentProfile.id);
                      }}
                      style={styles.smallNextButton}
                    >
                      <Text style={styles.nextButtonText}>
                        {currentProfile && currentProfile.isFollowedByUser
                          ? "unfollow"
                          : "follow"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.smallNextButton}>
                      <Text
                        onPress={async () => {
                          await this.props.createOrOpenChat(
                            [currentProfile.id, profile.id],
                            profile.id
                          );
                        }}
                        style={styles.nextButtonText}
                      >
                        Message
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </GestureRecognizer>
            <ScrollView
              scrollEnabled={true}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              style={{}}
              onScroll={this.handleScroll.bind(this)}
              scrollEventThrottle={50}
              ref={(view) => (this.scrollView = view)}
            >
              {posts &&
                posts.map(
                  (post, index) =>
                    post && (
                      <Post
                        isRecordingComment={isRecordingComment}
                        isUserProfile={isUserProfile}
                        key={post.id}
                        post={post}
                        postArray={posts}
                        index={index}
                        higherUp={false}
                      />
                    )
                )}
            </ScrollView>
            {recording && Platform.OS !== "web" && (
              <AudioRecordingVisualization
                recording={recording}
                barWidth={barWidth}
                barMargin={barMargin}
              />
            )}
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
                  zIndex: 6,
                }}
              >
                <FontAwesome5
                  onPress={async () => {
                    const { bio } = this.state;
                    this.mounted &&
                      this.setState({
                        recording: false,
                        isRecordingComment: false,
                      });
                    if (bio) {
                      await this.stopRecordingBio();
                      this.mounted && this.setState({ bio: false });
                    }
                  }}
                  style={{
                    fontSize: largeIconFontSize,
                    opacity: 1.0,
                  }}
                  name="record-vinyl"
                  color={"red"}
                />
              </View>
            )}
          </View>
        )}
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  posts: state.auth.posts,
  user: state.auth.user,
  currentProfile: state.display.viewingProfile,
  profile: state.auth.user.profile,
  postIndex: state.display.postIndex,
  showingComments: state.display.showingComments,
});

export default connect(mapStateToProps, {
  getUserPosts,
  updateProfilePic,
  getComments,
  followProfile,
  createOrOpenChat,
})(Profile);
