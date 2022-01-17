import React, { Component } from "react";
import { connect } from "react-redux";
// components
import Like from "../../reuseable/Like";
import PlayButton from "../../reuseable/PlayButton";
import {
  ScrollView,
  View,
  Platform,
  TouchableOpacity,
  Dimensions,
  TouchableHighlight,
  Text,
  Image,
} from "react-native";
import { Appbar } from "react-native-paper";
//styles
import { styles } from "../../../styles/Styles";
// icons
import { FontAwesome5 } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
// helpers
import { soundBlobToBase64 } from "../../../reuseableFunctions/helpers";
import { Audio } from "expo-av";
// redux
import { hideChats, viewMoreChats } from "../../../redux/actions/chat";

const { width, height } = Dimensions.get("window");
export class Chat extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      currentPlayingId: "",
      recording: false,
      audioBlobs: false,
      v: 0,
      fetching: false,
      lastFetched: 0,
    };
    this.scrollView = null;
    this.colors = ["white", "red"];
    this.mounted = true;
  }

  startRecording = async () => {
    try {
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
      this.mounted && this.setState({ recording });
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  stopRecording = async () => {
    const { recording } = this.state;
    console.log("Stopping recording..");
    if (!recording) {
      return;
    }
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
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
    console.log("Recording stopped and stored at", uri);
  };

  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = () => {
    const interval = setInterval(() => {
      const { v } = this.state;
      this.mounted &&
        this.state.recording &&
        this.setState({ v: v === 1 ? 0 : v + 1 });
    }, 1000);
    this.scrollView && this.scrollView.scrollToEnd({ animated: true });
  };

  componentDidUpdate = (prevProps, prevState) => {
    const { activeChats } = this.props;
    const { fetching } = this.state;
    if (
      activeChats &&
      prevProps.activeChats &&
      activeChats.length > prevProps.activeChats.length &&
      !fetching
    ) {
      this.scrollView.scrollToEnd({ animated: true });
    }
  };
  setPlaying(id) {
    this.mounted && this.setState({ playingId: id });
  }

  onPlaybackStatusUpdate(status) {
    if (status.didJustFinish)
      this.mounted && this.setState({ playing: "", playingId: "" });
  }

  goBack = () => console.log("Went back");

  handleMore = () => console.log("Shown more");

  render() {
    const { activeChats, activeChatId, profile, activeChatMembers, userName } =
      this.props;
    const { currentPlayingId, recording, audioBlobs, v, loading } = this.state;
    return (
      <View style={styles.chatPane}>
        <Appbar.Header
          style={{
            position: "absolute",
            top: 0,
            backgroundColor: "white",
            width,
            height: height * 0.1,
            zIndex: 2,
          }}
        >
          <Appbar.BackAction
            onPress={() => {
              console.log("here");
              this.props.hideChats();
            }}
          />
          <Appbar.Content
            title={activeChatMembers.map((member, res) => {
              return userName !== member.user.userName
                ? member.user.userName + " "
                : "";
            })}
            subtitle="Members"
          />
          <Appbar.Action icon="dots-vertical" onPress={this.handleMore} />
        </Appbar.Header>
        {loading && (
          <View style={styles.refresh}>
            <Text style={styles.nextButtonText}>Loading</Text>
          </View>
        )}
        <ScrollView
          ref={(view) => {
            this.scrollView = view;
          }}
          style={styles.messagesContainer}
          scrollEventThrottle={16}
          onScroll={async (event) => {
            const { activeChatId, activeChatMembers } = this.props;
            const { lastFetched } = this.state;
            if (
              event.nativeEvent.contentOffset.y === 0 &&
              Math.floor(activeChats.length / 20) > lastFetched
            ) {
              this.mounted &&
                this.setState({
                  loading: true,
                  fetching: true,
                  lastFetched: Math.floor(activeChats.length / 20),
                });
              await this.props.viewMoreChats(
                { id: activeChatId, members: activeChatMembers },
                activeChats && activeChats.length > 0
                  ? Math.floor(activeChats.length / 20)
                  : 0
              );
              this.mounted &&
                this.setState({ loading: false, fetching: false });
            }
          }}
        >
          {activeChats &&
            activeChats.length > 0 &&
            activeChats.map((chat, index) => (
              <View
                key={chat.id}
                style={
                  profile.id === chat.owner.id
                    ? styles.userChat
                    : styles.foreignChat
                }
              >
                <View>
                  <Text style={styles.blackText}>
                    @
                    {chat && chat.owner && chat.owner.user
                      ? chat.owner.user.userName
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
                        chat && chat.owner && chat.owner.image
                          ? {
                              uri: chat.owner.image.signedUrl,
                            }
                          : require("../../../assets/no-profile-pic-icon-27.jpg")
                      }
                      style={styles.commentImg}
                    />
                  </TouchableHighlight>
                </View>
                {chat.signedUrl && (
                  <View style={styles.commentPlayContainer}>
                    {chat.signedUrl && (
                      <Like type={"Chat"} postId={chat.id} post={chat} />
                    )}
                    {chat.signedUrl && (
                      <PlayButton
                        containerStyle={{}}
                        color={"#1A3561"}
                        currentPlayingId={currentPlayingId}
                        size={48}
                        post={chat}
                        setPlaying={this.setPlaying.bind(this)}
                        onPlaybackStatusUpdate={this.onPlaybackStatusUpdate.bind(
                          this
                        )}
                      />
                    )}
                    {chat.owner.id === profile.id && (
                      <Feather
                        onPress={async () => {}}
                        name="scissors"
                        size={24}
                        color="red"
                      />
                    )}
                  </View>
                )}
              </View>
            ))}
        </ScrollView>
        <View style={styles.recordingContainerComments}>
          <View style={styles.iconContainerComments}>
            {audioBlobs && (
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
                onPress={this.startRecording}
                name="microphone-plus"
                size={75}
                color="red"
                style={styles.recordingMicIconComments}
              />
            ) : (
              <FontAwesome5
                onPress={this.stopRecording}
                style={styles.currentRecordingIconComments}
                name="record-vinyl"
                size={24}
                color={this.colors[v]}
              />
            )}
            {audioBlobs && (
              <TouchableOpacity
                onPress={async () => {
                  let fileType;
                  const { socket, activeChatId } = this.props;
                  const base64Url = await soundBlobToBase64(audioBlobs.uri);
                  if (base64Url != null) {
                    fileType = audioBlobs.type;
                    socket.emit("new message", {
                      messageData: base64Url,
                      chatId: activeChatId,
                      fileType,
                    });
                  } else {
                    console.log("error with blob");
                  }
                  //  send message
                }}
              >
                <FontAwesome name="send" size={24} color="black" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  activeChats: state.chat.activeChats,
  activeChatId: state.chat.activeChatId,
  profile: state.auth.user.profile,
  activeChatMembers: state.chat.activeChatMembers,
  userName: state.auth.user.userName,
  socket: state.auth.socket,
});

export default connect(mapStateToProps, { hideChats, viewMoreChats })(Chat);
