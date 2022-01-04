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
} from "react-native";
// icons
import { Ionicons } from "@expo/vector-icons";
// styles
import { styles } from "../../../styles/Styles";
// children
import Settings from "./Settings";
import Bio from "./Bio";
import Post from "./Post";
// redux
import { uploadBio, getUserPosts } from "../../../redux/actions/recording";
// helpers
import { playSound } from "../../../reuseableFunctions/helpers";
import GestureRecognizer, {
  swipeDirections,
} from "react-native-swipe-gestures";
// audio
import { Audio } from "expo-av";

export class Profile extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      settingsShown: false,
      recording: false,
      playbackObject: {},
      playing: "",
      currentBioRecording: "",
      playingId: "",
      newBioRecording: {},
    };

    this.mounted = true;
  }

  async onSwipeDown(gestureState) {
    const { getUserPosts, currentProfile } = this.props;
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
      await this.stopCurrentSound();
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      console.log("Starting recording..");
      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY,
        this.onRecordingStatusUpdate
      );
      console.log(recording);
      this.mounted && this.setState({ recording });
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  stopRecordingBio = async () => {
    const { recording } = this.state;
    console.log("Stopping recording..");
    try {
      await recording.stopAndUnloadAsync();
    } catch (err) {}
    const uri = recording.getURI();
    const finalDuration = recording._finalDurationMillis;
    this.mounted &&
      this.setState({
        recording: false,
        newBioRecording: {
          uri,
          finalDuration,
          type: Platform.OS === "web" ? "audio/webm" : ".m4a",
        },
      });
    console.log("Recording stopped and stored at", uri);
  };

  onPlaybackStatusUpdate(status) {
    if (status.didJustFinish)
      this.mounted && this.setState({ playing: "", playingId: "" });
  }

  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = async () => {
    const { getUserPosts, currentProfile, profile, posts } = this.props;
    if (profile.id !== currentProfile.id || !posts || posts.length === 0) {
      this.mounted && this.setState({ loading: true });
      await getUserPosts(currentProfile.id, 0);
      this.mounted && this.setState({ loading: false });
    }
  };

  hideSetting = () => {
    this.mounted && this.setState({ settingsShown: false });
  };

  setPlaying(id) {
    this.mounted && this.setState({ playingId: id });
  }

  setNewBioRecording = (newR) => {
    this.mounted && this.setState({ newBioRecording: newR });
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
      playing,
      playingId,
      loading,
    } = this.state;
    const { user, profile, currentProfile, posts } = this.props;
    const isUserProfile = profile.id === currentProfile.id;

    return (
      <GestureRecognizer
        onSwipeDown={(state) => this.onSwipeDown(state)}
        config={config}
        style={{
          flex: 1,
          backgroundColor: this.state.backgroundColor,
        }}
      >
        {!settingsShown && isUserProfile && (
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
            <View style={styles.profileHeader}>
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
                    user && user.profile && user.profile.image
                      ? {
                          uri: user.profile.image,
                        }
                      : require("../../../assets/no-profile-pic-icon-27.jpg")
                  }
                  style={styles.profileImgSmall}
                />
              </TouchableHighlight>
              <Text style={styles.profileText}>@{user.userName}</Text>
              <Bio
                startRecording={this.startRecording.bind(this)}
                stopRecordingBio={this.stopRecordingBio.bind(this)}
                currentSound={playingId}
                onPlaybackStatusUpdate={this.onPlaybackStatusUpdate.bind(this)}
                setPlaying={this.setPlaying.bind(this)}
                setNewBioRecording={this.setNewBioRecording.bind(this)}
                newBioRecording={newBioRecording}
              />
            </View>
            <ScrollView
              scrollEnabled={true}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              style={styles.postsContainer}
            >
              {posts &&
                posts.map((post, index) => (
                  <Post
                    key={post.id}
                    post={post}
                    currentSound={playingId}
                    onPlaybackStatusUpdate={this.onPlaybackStatusUpdate.bind(
                      this
                    )}
                    setPlaying={this.setPlaying.bind(this)}
                  />
                ))}
            </ScrollView>
          </View>
        )}
      </GestureRecognizer>
    );
  }
}

const mapStateToProps = (state) => ({
  posts: state.auth.posts,
  user: state.auth.user,
  currentProfile: state.display.viewingProfile,
  profile: state.auth.user.profile,
});

export default connect(mapStateToProps, { uploadBio, getUserPosts })(Profile);
