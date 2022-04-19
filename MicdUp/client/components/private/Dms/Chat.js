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
import SpeechToText from "../../reuseable/SpeechToText";
import { Appbar } from "react-native-paper";
import AudioRecordingVisualization from "../../reuseable/AudioRecordingVisualization";
//styles
import { styles, largeIconFontSize } from "../../../styles/Styles";
// icons
import { FontAwesome5 } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
// helpers
import { soundBlobToBase64 } from "../../../reuseableFunctions/helpers";
// audio
import Voice from "@react-native-voice/voice";
// redux
import { addLoading, removeLoading } from "../../../redux/actions/display";
import { changeSound, pauseSound } from "../../../redux/actions/sound";
import { hideChats, viewMoreChats } from "../../../redux/actions/chat";
import {
  startRecording,
  stopRecording,
} from "../../../reuseableFunctions/recording";
import {
  onSpeechResults,
  onSpeechStart,
} from "../../../reuseableFunctions/helpers";
const { width, height } = Dimensions.get("window");

const barWidth = 5;
const barMargin = 1;

export class Chat extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      recording: false,
      audioBlobs: false,
      v: 0,
      fetching: false,
      lastFetched: 0,
      soundLevels: [],
      results: [],
    };
    try {
      Voice.onSpeechResults = onSpeechResults.bind(this);
      Voice.onSpeechStart = onSpeechStart.bind(this);
    } catch (err) {
      console.log(err);
    }
    this.scrollView = null;
    this.colors = ["white", "red"];
    this.mounted = true;
  }

  startRecordingChat = async () => {
    this.props.addLoading("CHAT");
    if (Platform.OS !== "web") {
      const recording = await startRecording(Voice, () => {});
      this.mounted && this.setState({ recording, startTime: Date.now() });
    } else {
      const recording = await startRecording(Voice, () => {});
      this.mounted && this.setState({ recording, startTime: Date.now() });
    }
    this.props.removeLoading("CHAT");
  };

  stopRecording = async () => {
    const { recording, results } = this.state;
    if (!recording) {
      return;
    }
    this.props.addLoading("CHAT");
    let uri;
    if (Platform.OS !== "web") {
      uri = await stopRecording(recording, Voice);
    } else {
      uri = await stopRecording(recording);
    }
    const finalDuration = recording._finalDurationMillis;
    this.mounted &&
      this.setState({
        recording: false,
        audioBlobs: {
          uri,
          finalDuration,
          results,
          type: Platform.OS === "web" ? "audio/webm" : ".m4a",
        },
      });
    this.props.removeLoading("CHAT");
    console.log("Recording stopped and stored at", uri);
  };

  componentWillUnmount = async () => {
    this.props.removeLoading("CHAT");
    await this.stopRecording();
    Voice.stop();
    this.mounted = false;
  };

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
  goBack = () => console.log("Went back");

  handleMore = () => console.log("Shown more");

  render() {
    const {
      activeChats,
      profile,
      activeChatMembers,
      userName,
      playingId,
      isPause,
      playingUri,
    } = this.props;
    const { recording, audioBlobs, v } = this.state;
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
              this.props.addLoading("CHAT");
              await this.props.viewMoreChats(
                { id: activeChatId, members: activeChatMembers },
                activeChats && activeChats.length > 0
                  ? Math.floor(activeChats.length / 20)
                  : 0
              );
              this.props.removeLoading("CHAT");
              this.mounted &&
                this.setState({ loading: false, fetching: false });
            }
          }}
        >
          {activeChats &&
            activeChats.length > 0 &&
            activeChats.map((chat, index) => (
              <TouchableOpacity
                key={chat.id}
                style={[
                  profile.id === chat.owner.id
                    ? styles.userChat
                    : styles.foreignChat,
                  {
                    backgroundColor:
                      playingId === chat.id && !isPause ? "#6FF6FF" : "white",
                  },
                ]}
                onPress={async () => {
                  this.props.addLoading("CHAT");
                  if (playingId === chat.id && !isPause) {
                    await this.props.pauseSound();
                  } else if (chat.signedUrl) {
                    await this.props.changeSound(chat, chat.signedUrl);
                  }
                  this.props.removeLoading("CHAT");
                }}
              >
                <View style={{ flex: 3 }}>
                  <Text
                    numberOfLines={1}
                    style={[styles.blackText, { width: 200 }]}
                  >
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
                <View
                  style={{ flex: 7, position: "relative", overflow: "hidden" }}
                >
                  {chat.speechToText && chat.speechToText[0] && (
                    <SpeechToText
                      containerStyle={[{ flexDirection: "row" }]}
                      fontSize={24}
                      post={chat}
                      textStyle={{}}
                    />
                  )}
                </View>
                {chat.signedUrl && (
                  <View style={{ flex: 2 }}>
                    {chat.signedUrl && (
                      <Like
                        type={"Chat"}
                        postId={chat.id}
                        ownerId={chat.owner.id}
                        post={chat}
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
              </TouchableOpacity>
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
            {audioBlobs ? (
              playingUri === audioBlobs.uri && !isPause ? (
                <MaterialCommunityIcons
                  onPress={async () => {
                    this.props.addLoading("CHAT");
                    await this.props.pauseSound();
                    this.props.removeLoading("CHAT");
                  }}
                  name="pause-circle"
                  size={75}
                  color="#6FF6FF"
                  style={styles.recordingMicIconComments}
                />
              ) : (
                <MaterialCommunityIcons
                  onPress={async () => {
                    this.props.addLoading("CHAT");

                    await this.props.changeSound(audioBlobs, audioBlobs.uri);
                    this.props.removeLoading("CHAT");
                  }}
                  name="play-circle"
                  size={75}
                  color="#6FF6FF"
                  style={styles.recordingMicIconComments}
                />
              )
            ) : !recording ? (
              <MaterialCommunityIcons
                onPress={this.startRecordingChat}
                name="microphone-plus"
                size={75}
                color="red"
                style={styles.recordingMicIconComments}
              />
            ) : (
              recording &&
              Platform.OS === "web" && (
                <FontAwesome5
                  onPress={this.stopRecording}
                  style={styles.currentRecordingIconComments}
                  name="record-vinyl"
                  size={24}
                  color={this.colors[v]}
                />
              )
            )}
            {audioBlobs && (
              <TouchableOpacity
                onPress={async () => {
                  let fileType;
                  const { socket, activeChatId } = this.props;
                  const { results } = this.state;
                  const base64Url = await soundBlobToBase64(audioBlobs.uri);
                  if (base64Url != null) {
                    fileType = audioBlobs.type;
                    socket.emit("new message", {
                      messageData: base64Url,
                      chatId: activeChatId,
                      fileType,
                      speechToText: results,
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
              onPress={() => {
                this.stopRecording();
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
  playingId:
    state.sound.currentPlayingSound && state.sound.currentPlayingSound.id,
  playingUri:
    state.sound.currentPlayingSound && state.sound.currentPlayingSound.uri,
  isPause: state.sound.isPause,
});

export default connect(mapStateToProps, {
  hideChats,
  viewMoreChats,
  changeSound,
  pauseSound,
  addLoading,
  removeLoading,
})(Chat);
