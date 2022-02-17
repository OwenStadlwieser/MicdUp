import React, { Component } from "react";
import { connect } from "react-redux";
import {
  TouchableOpacity,
  View,
  Image,
  Text,
  TouchableHighlight,
  Platform,
  StyleSheet,
  Dimensions,
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
} from "../../../styles/Styles";
// children
import Settings from "./Settings";
import Bio from "./Bio";
import Post from "./Post";
import ImagePicker from "../../reuseable/ImagePicker";
import AudioRecordingVisualization from "../../reuseable/AudioRecordingVisualization";
import Comment from "../../reuseable/Comment";
import { SwipeListView } from "react-native-swipe-list-view";
import ListOfAccounts from "../../reuseable/ListOfAccounts";
// redux
import {
  getUserPosts,
  getComments,
  deletePost,
} from "../../../redux/actions/recording";
import {
  updateProfilePic,
  followProfile,
  getFollowersQuery,
  getFollowingQuery,
  getPrivatesQuery,
  addToPrivates,
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
      postsInvalid: false,
      prevLength: 0,
      showingListOfAccounts: false,
      listOfAccountsParams: {},
    };
    this.scrollView = null;
    this.mounted = true;
  }

  async handleScroll(event) {
    const { posts, getUserPosts, currentProfile } = this.props;
    const { loading, prevLength } = this.state;
    try {
      if (
        event.nativeEvent.contentOffset.y >
          posts.length * postHeight - height &&
        !loading &&
        prevLength !== posts.length
      ) {
        this.mounted &&
          this.setState({ loading: true, prevLength: posts.length });
        await getUserPosts(currentProfile.id, Math.round(posts.length / 20));
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
    } else if (
      posts &&
      currentProfile &&
      posts.length > 0 &&
      posts[0].owner.id !== currentProfile.id
    ) {
      this.mounted && this.setState({ loading: true, postsInvalid: true });
      await getUserPosts(currentProfile.id, 0);
      this.mounted && this.setState({ loading: false, postsInvalid: false });
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
      showingListOfAccounts,
      listOfAccountsParams,
    } = this.state;
    const {
      userName,
      profile,
      currentProfile,
      posts,
      postIndex,
      showingComments,
      backArrow,
      backAction,
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
        {showingListOfAccounts && (
          <ListOfAccounts
            hideList={() => {
              this.mounted && this.setState({ showingListOfAccounts: false });
            }}
            isUserProfile={isUserProfile}
            params={listOfAccountsParams}
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
                </View>
                <Text numberOfLines={1} style={[styles.profileText]}>
                  @{userName}
                </Text>
                <Text style={styles.followersText}>
                  <Text
                    onPress={() => {
                      const { getFollowersQuery } = this.props;
                      this.mounted &&
                        this.setState({
                          showingListOfAccounts: true,
                          listOfAccountsParams: {
                            title: "Followers",
                            getData: async function (skipMult) {
                              console.log(currentProfile);
                              const res = await getFollowersQuery(
                                currentProfile.id,
                                skipMult
                              );
                              return res && res.followers ? res.followers : [];
                            },
                          },
                        });
                    }}
                    style={{ fontSize: small, fontStyle: "italic " }}
                  >
                    {currentProfile ? currentProfile.followersCount : 0}{" "}
                    Followers{"  "}
                  </Text>
                  <Text
                    onPress={() => {
                      const { getFollowingQuery } = this.props;
                      this.mounted &&
                        this.setState({
                          showingListOfAccounts: true,

                          listOfAccountsParams: {
                            title: "Following",
                            getData: async function (skipMult) {
                              const res = await getFollowingQuery(
                                currentProfile.id,
                                skipMult
                              );
                              return res && res.following ? res.following : [];
                            },
                          },
                        });
                    }}
                    style={{ fontSize: small, fontStyle: "italic " }}
                  >
                    {currentProfile
                      ? currentProfile.followingCount + " Following  "
                      : 0 + " Following  "}
                  </Text>
                  <Text
                    onPress={() => {
                      const { getPrivatesQuery } = this.props;
                      if (!isUserProfile) return;
                      this.mounted &&
                        this.setState({
                          showingListOfAccounts: true,
                          isPrivates: true,
                          listOfAccountsParams: {
                            title: "Privates",
                            getData: async function (skipMult) {
                              const res = await getPrivatesQuery(skipMult);
                              return res && res.privates ? res.privates : [];
                            },
                          },
                        });
                    }}
                    style={{ fontSize: small, fontStyle: "italic " }}
                  >
                    {currentProfile && currentProfile.privatesCount
                      ? currentProfile.privatesCount
                      : 0}{" "}
                    Privates{"        "}
                  </Text>
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
                    <TouchableOpacity
                      onPress={async () => {
                        await this.props.addToPrivates(currentProfile.id);
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
            <SwipeListView
              data={posts}
              disableRightSwipe
              disableLeftSwipe={!isUserProfile}
              onScroll={this.handleScroll.bind(this)}
              scrollEventThrottle={50}
              ref={(view) => (this.scrollView = view)}
              useNativeDriver={false}
              renderItem={(data, rowMap) => (
                <Post
                  isRecordingComment={isRecordingComment}
                  isUserProfile={isUserProfile}
                  key={data.item.id}
                  post={data.item}
                  postArray={posts}
                  index={data.index}
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
                        await this.props.deletePost(data.item.id);
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
        )}
      </View>
    );
  }
}

const listStyles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
  },
  backTextWhite: {
    color: "#FFF",
  },
  rowFront: {
    alignItems: "center",
    backgroundColor: "#CCC",
    borderBottomColor: "black",
    borderBottomWidth: 1,
    justifyContent: "center",
    height: 50,
  },
  rowBack: {
    alignItems: "center",
    backgroundColor: "transparent",
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 15,
    right: 0,
    width,
  },
  backRightBtn: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    position: "absolute",
    top: 0,
    width: 75,
    borderWidth: 2,
    zIndex: -1,
  },
  backRightBtnRight: {
    backgroundColor: "white",
    right: 0,
    height: postHeight,
    borderRadius: 8,
  },
});

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
  deletePost,
  getFollowersQuery,
  getFollowingQuery,
  getPrivatesQuery,
  addToPrivates,
})(Profile);
