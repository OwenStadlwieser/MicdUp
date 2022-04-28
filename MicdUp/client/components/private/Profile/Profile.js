import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import {
  TouchableOpacity,
  View,
  Image,
  Text,
  TouchableHighlight,
  Platform,
  Dimensions,
  RefreshControl,
} from "react-native";
// icons
import { Ionicons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
// styles
import {
  styles,
  postHeight,
  largeIconFontSize,
  small,
  listStyles,
} from "../../../styles/Styles";
// children
import Bio from "./Bio";
import Post from "./Post";
import ImagePicker from "../../reuseable/ImagePicker";
import AudioRecordingVisualization from "../../reuseable/AudioRecordingVisualization";
import { SwipeListView } from "react-native-swipe-list-view";
import GestureRecognizer from "react-native-swipe-gestures";
import OtherUserSettings from "../../reuseable/OtherUserSettings";
// redux
import {
  getUserPosts,
  getComments,
  deletePost,
  clearPosts,
} from "../../../redux/actions/recording";
import {
  updateProfilePic,
  followProfile,
  addToPrivates,
} from "../../../redux/actions/profile";
import { createOrOpenChat } from "../../../redux/actions/chat";
import {
  addLoading,
  removeLoading,
  setCurrentKey,
  navigate,
  setList,
} from "../../../redux/actions/display";
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
      recording: false,
      playbackObject: {},
      currentBioRecording: "",
      newBioRecording: {},
      selectImage: false,
      bio: false,
      isRecordingComment: false,
      postsInvalid: false,
      prevLength: 0,
      showingListOfAccounts: false,
      listOfAccountsParams: {},
      posts: [],
      outerScrollEnabled: true,
      refreshing: false,
    };
    this.scrollView = null;
    this.mounted = true;
  }

  setOuterScroll = (setTo) => {
    this.mounted && this.setState({ outerScrollEnabled: setTo });
  };

  async handleScroll(event) {
    const { getUserPosts, cachedPosts } = this.props;
    const { loading, prevLength } = this.state;
    const { id } = this.props.currentProfile;
    const posts = cachedPosts[id];
    try {
      if (
        event.nativeEvent.contentOffset.y >
          posts.length * postHeight - height &&
        !loading &&
        prevLength !== posts.length
      ) {
        this.props.addLoading("Profile");
        this.mounted &&
          this.setState({ prevLength: posts.length, loading: true });
        await getUserPosts(id, Math.round(posts.length / 20));
        this.props.removeLoading("Profile");
        this.mounted && this.setState({ loading: false });
      }
    } catch (err) {
      console.log(err);
    }
  }

  async onSwipeDown(gestureState) {
    const { getUserPosts, clearPosts } = this.props;
    const { id } = this.props.currentProfile;
    if (this.state.loading) return;
    this.props.addLoading("Profile");
    await clearPosts(id);
    await getUserPosts(id, 0);
    this.props.removeLoading("Profile");
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
    this.props.removeLoading("Profile");
  };

  getPosts = async (fromRefresh = false) => {
    const { getUserPosts, cachedPosts } = this.props;
    const { id } = this.props.currentProfile;
    this.mounted && this.setState({ refreshing: true });
    const posts = cachedPosts[id];
    if (posts && posts.length > 0 && fromRefresh) {
      await getUserPosts(id, 0);
    } else if (posts && posts.length > 0) {
    } else if (id) {
      this.props.addLoading("Profile");
      await getUserPosts(id, 0);
      this.props.removeLoading("Profile");
    }
    this.mounted && this.setState({ refreshing: false });
  };

  componentDidMount = async () => {
    await this.getPosts();
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
      recording,
      newBioRecording,
      playingId,
      loading,
      selectImage,
      outerScrollEnabled,
      showingListOfAccounts,
      refreshing,
      otherUserSettings,
    } = this.state;
    const { profile, currentProfile, backArrow, cachedPosts } = this.props;
    const { userName } = this.props.currentProfile.user
      ? this.props.currentProfile.user
      : {};
    const { id } = this.props.currentProfile;
    const isUserProfile = profile && currentProfile ? profile.id === id : true;
    const posts = cachedPosts[id];
    if (!profile && !currentProfile) {
      return (
        <View key={this.props.route.params.key}>
          <Text>Loading</Text>
        </View>
      );
    }
    if (otherUserSettings) {
      return (
        <OtherUserSettings
          key={this.props.route.params.key}
          currentProfile={currentProfile}
          userName={userName}
          setHidden={() => {
            this.mounted && this.setState({ otherUserSettings: false });
          }}
        ></OtherUserSettings>
      );
    }
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: this.state.backgroundColor,
        }}
        key={this.props.route.params.key}
      >
        {selectImage && (
          <ImagePicker
            setHidden={this.setHidden.bind(this)}
            setImage={this.setImage.bind(this)}
          />
        )}
        <Ionicons
          onPress={() => {
            isUserProfile
              ? this.props.navigate("Settings")
              : this.mounted && this.setState({ otherUserSettings: true });
          }}
          name="settings-outline"
          size={24}
          color="white"
          style={styles.topRightIcon}
        />
        {backArrow && !showingListOfAccounts && (
          <AntDesign
            style={[styles.topLeftIcon, { zIndex: 8 }]}
            name="leftcircle"
            size={24}
            color="white"
            onPress={() => {
              this.props.backAction();
            }}
          />
        )}
        <View style={styles.paneUncentered}>
          {loading && (
            <View style={styles.refresh}>
              <Text style={styles.nextButtonText}>Loading</Text>
            </View>
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
              </View>
              <Text numberOfLines={1} style={[styles.profileText]}>
                @{userName}
              </Text>
              <Text style={styles.followersText}>
                <Text
                  onPress={() => {
                    this.props.setList("Followers");
                  }}
                  style={{ fontSize: small, fontStyle: "italic" }}
                >
                  {currentProfile ? currentProfile.followersCount : 0} Followers
                  {"  "}
                </Text>
                <Text
                  onPress={() => {
                    this.props.setList("Following");
                  }}
                  style={{ fontSize: small, fontStyle: "italic" }}
                >
                  {currentProfile
                    ? currentProfile.followingCount + " Following  "
                    : 0 + " Following  "}
                </Text>
                <Text
                  onPress={() => {
                    if (!isUserProfile) return;
                    this.props.setList("Privates");
                  }}
                  style={{ fontSize: small, fontStyle: "italic" }}
                >
                  {currentProfile && currentProfile.privatesCount
                    ? currentProfile.privatesCount
                    : 0}{" "}
                  Privates{"        "}
                </Text>
              </Text>
              <Bio
                id={id}
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
                      await this.props.followProfile(id);
                    }}
                    style={styles.smallNextButton}
                  >
                    <Text style={styles.nextButtonText}>
                      {currentProfile && currentProfile.isFollowedByUser
                        ? "unfollow"
                        : "follow"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={async () => {
                      await this.props.addToPrivates(
                        id,
                        currentProfile.isPrivateByUser
                      );
                    }}
                    style={styles.smallNextButton}
                  >
                    <Text style={styles.nextButtonText}>
                      {currentProfile && currentProfile.isPrivateByUser
                        ? "remove private"
                        : "add private"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.smallNextButton}>
                    <Text
                      onPress={async () => {
                        await this.props.createOrOpenChat(
                          [id, profile.id],
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
          <SwipeListView
            data={posts ? posts.filter((i) => i) : []}
            disableRightSwipe
            disableLeftSwipe={!isUserProfile || !outerScrollEnabled}
            onScroll={this.handleScroll.bind(this)}
            scrollEventThrottle={50}
            ref={(view) => (this.scrollView = view)}
            useNativeDriver={false}
            scrollEnabled={outerScrollEnabled}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  this.getPosts(true);
                }}
              />
            }
            renderItem={(data, rowMap) => (
              <Post
                isUserProfile={isUserProfile}
                key={data.item.id}
                post={data.item}
                postArray={posts}
                currentKey={currentProfile.id}
                setOuterScroll={this.setOuterScroll.bind(this)}
                index={data.index}
                canViewPrivate={
                  profile && id === profile.id
                    ? true
                    : currentProfile.canViewPrivatesFromUser
                }
                higherUp={false}
              />
            )}
            renderHiddenItem={(data, rowMap) => {
              return (
                <View style={listStyles.rowBack}>
                  <TouchableOpacity
                    style={[
                      listStyles.backRightBtn,
                      listStyles.backRightBtnRight,
                    ]}
                    onPress={async () => {
                      await this.props.deletePost(
                        data.item.id,
                        currentProfile.id
                      );
                    }}
                  >
                    <Entypo name="trash" size={24} color="red" />
                  </TouchableOpacity>
                </View>
              );
            }}
            rightOpenValue={-75}
          />
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
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  cachedPosts: state.auth.posts,
  currentProfile: state.display.viewingProfile,
  user: state.auth.user,
  profile: state.auth.user.profile,
});

export default connect(mapStateToProps, {
  getUserPosts,
  updateProfilePic,
  getComments,
  followProfile,
  createOrOpenChat,
  deletePost,
  addToPrivates,
  clearPosts,
  addLoading,
  removeLoading,
  setCurrentKey,
  navigate,
  setList,
})(Profile);
