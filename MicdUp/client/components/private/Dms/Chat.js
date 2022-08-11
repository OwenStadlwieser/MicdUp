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
  RefreshControl,
} from "react-native";
import SpeechToText from "../../reuseable/SpeechToText";
//styles
import { styles, chatWidth } from "../../../styles/Styles";
// icons
import { FontAwesome5 } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
// audio
import Voice from "@react-native-voice/voice";
// redux
import {
  addLoading,
  removeLoading,
  showHeader,
  showMessage,
} from "../../../redux/actions/display";
import { changeSound, pauseSound } from "../../../redux/actions/sound";
import {
  hideChats,
  viewMoreChats,
  chatRecieved,
} from "../../../redux/actions/chat";
import RecordingControls from "../../reuseable/RecordingControls";
import { setSocket } from "../../../redux/actions/auth";
// helpers
import {
  getCurrentTime,
  onSpeechResults,
  onSpeechStart,
  forHumans,
  configureSocket,
  getData,
} from "../../../reuseableFunctions/helpers";
import { rollbar } from "../../../reuseableFunctions/constants";

export class Chat extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      recording: false,
      fetching: false,
      lastFetched: 0,
      soundLevels: [],
      results: [],
      controlsKey: 1,
    };
    try {
      Voice.onSpeechResults = onSpeechResults.bind(this);
      Voice.onSpeechStart = onSpeechStart.bind(this);
    } catch (err) {
      rollbar.log(err);
    }
    this.scrollView = null;
    this.mounted = true;
  }

  backButtonAction = () => {
    this.mounted &&
      this.setState({
        replyingTo: "",
        text: "",
        replyingToName: "",
        parents: null,
      });
  };

  disconnectFunction = async () => {
    const token = await getData("token");
    if (token) {
      setTimeout(async function () {
        await this.startSocket();
      }, 1000);
    }
  };

  messageFunction = async (message, chatId) => {
    const { profile } = this.props;
    if (message.owner.id == profile.id) {
      this.props.removeLoading("MessageSending");
    }
    this.props.chatRecieved(message, chatId);
  };

  startSocket = async () => {
    const { setSocket } = this.props;
    const socket = await configureSocket(
      token,
      this.messageFunction,
      this.disconnectFunction
    );
    setSocket(socket);
    return socket;
  };

  onSend = async (base64Url, fileType, results) => {
    const { activeChatId, socket, showMessage, addLoading, loadingMap } =
      this.props;
    if (loadingMap && loadingMap["MessageSending"]) {
      showMessage({
        success: false,
        message: "Failed to send, currently sending previous message",
      });
      return;
    }
    if (socket.connected) {
      addLoading("MessageSending");
      socket.emit("new message", {
        messageData: base64Url,
        chatId: activeChatId,
        fileType,
        speechToText: results,
      });
    } else {
      addLoading("MessageSending");
      showMessage({
        success: false,
        message: "Establishing connection to server",
      });
      let newSocket = await this.startSocket();
      const intervalId = setTimeout(function () {
        newSocket = this.props.socket;
        if (newSocket.connected) {
          showMessage({
            success: true,
            message: "Established connection to server",
          });
          clearInterval(intervalId);
          newSocket.emit("new message", {
            messageData: base64Url,
            chatId: activeChatId,
            fileType,
            speechToText: results,
          });
        }
      }, 200);
      this.mounted && this.setState({ intervalId });
    }
  };
  componentWillUnmount = async () => {
    const { intervalId } = this.state;
    clearInterval(intervalId);
    this.props.showHeader(true);
    this.props.removeLoading("CHAT");
    this.props.removeLoading("MessageSending");
    Voice.stop();
    this.mounted = false;
  };

  componentDidMount = () => {
    this.props.showHeader(false);
    this.scrollView && this.scrollView.scrollToEnd({ animated: true });
  };

  componentDidUpdate = (prevProps, prevState) => {
    const { activeChats, loadingMap } = this.props;
    const { fetching, controlsKey } = this.state;
    if (
      activeChats &&
      prevProps.activeChats &&
      activeChats.length > prevProps.activeChats.length &&
      !fetching
    ) {
      this.scrollView.scrollToEnd({ animated: true });
    }
    if (
      prevProps.loadingMap &&
      prevProps.loadingMap["MessageSending"] &&
      (!loadingMap || !loadingMap["MessageSending"])
    ) {
      this.mounted && this.setState({ controlsKey: controlsKey + 1 });
    }
  };
  goBack = () => console.log("Went back");

  handleMore = () => console.log("Shown more");

  render() {
    const { activeChats, profile, playingId, isPause } = this.props;
    const { recording, refreshing, controlsKey } = this.state;
    return (
      <View style={styles.pane}>
        <View style={styles.chatPane}>
          <View style={styles.messagesParentContainer}>
            <ScrollView
              ref={(view) => {
                this.scrollView = view;
              }}
              onContentSizeChange={() => {
                const { lastFetched } = this.state;
                !lastFetched && this.scrollView.scrollToEnd({ animated: true });
              }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={async () => {
                    this.mounted && this.setState({ refreshing: true });
                    const { activeChatId, activeChatMembers } = this.props;
                    const { lastFetched } = this.state;
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
                    this.mounted && this.setState({ refreshing: false });
                  }}
                />
              }
              contentContainerStyle={styles.messagesContainer}
              scrollEventThrottle={16}
            >
              {activeChats &&
                activeChats.length > 0 &&
                activeChats.map(
                  (chat, index) =>
                    chat && (
                      <TouchableOpacity
                        key={chat.id}
                        style={[
                          profile.id === chat.owner.id
                            ? styles.userChat
                            : styles.foreignChat,
                          {
                            backgroundColor:
                              playingId === chat.id && !isPause
                                ? "#6FF6FF"
                                : "white",
                          },
                        ]}
                        onPress={async () => {
                          console.log(getCurrentTime());
                          console.log(chat.dateCreated);
                          this.props.addLoading("CHAT");
                          if (playingId === chat.id && !isPause) {
                            await this.props.pauseSound();
                          } else if (chat.signedUrl) {
                            await this.props.changeSound(chat, chat.signedUrl);
                          }
                          this.props.removeLoading("CHAT");
                        }}
                      >
                        <View
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            width: chatWidth,
                            paddingHorizontal: 20,
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
                            style={{
                              flex: 7,
                              position: "relative",
                              overflow: "hidden",
                            }}
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
                            <View
                              style={{
                                flex: 2,
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              {chat.signedUrl && (
                                <Like
                                  type={"Chat"}
                                  postId={chat.id}
                                  ownerId={chat.owner.id}
                                  post={chat}
                                  currentKey={"CHAT"}
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
                        <View
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            flexDirection: "row",
                            width: chatWidth,
                            paddingHorizontal: 20,
                          }}
                        >
                          <Text
                            style={{
                              alignSelf: "flex-start",
                              fontWeight: "700",
                            }}
                          >
                            {forHumans(getCurrentTime() - chat.dateCreated)} Ago
                          </Text>
                          <Text
                            style={{
                              alignSelf: "flex-start",
                              fontWeight: "700",
                            }}
                          >
                            {forHumans(chat.duration)}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )
                )}
            </ScrollView>
          </View>
          <RecordingControls
            key={controlsKey}
            onRecordingStart={(() => {
              this.mounted && this.setState({ recording: true });
            }).bind(this)}
            backButtonAction={this.backButtonAction.bind(this)}
            onSend={this.onSend.bind(this)}
          />
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
  playingId:
    state.sound.currentPlayingSound && state.sound.currentPlayingSound.id,
  isPause: state.sound.isPause,
  loadingMap: state.display.loadingMap,
});

export default connect(mapStateToProps, {
  hideChats,
  viewMoreChats,
  changeSound,
  pauseSound,
  addLoading,
  removeLoading,
  showHeader,
  showMessage,
  chatRecieved,
  setSocket,
})(Chat);
