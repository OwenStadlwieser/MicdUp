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
  RefreshControl
} from "react-native";
import SpeechToText from "../../reuseable/SpeechToText";
import { Appbar } from "react-native-paper";
//styles
import { styles, largeIconFontSize } from "../../../styles/Styles";
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
} from "../../../redux/actions/display";
import { changeSound, pauseSound } from "../../../redux/actions/sound";
import { hideChats, viewMoreChats } from "../../../redux/actions/chat";
import {
  onSpeechResults,
  onSpeechStart,
} from "../../../reuseableFunctions/helpers";
import RecordingControls from "../../reuseable/RecordingControls";
// reuseable
import { stopRecording } from "../../../reuseableFunctions/recording";

const { width, height } = Dimensions.get("window");


export class Chat extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      recording: false,
      audioBlobs: false,
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


  onSend = (base64Url, fileType, results) => {
    const { activeChatId, socket } = this.props;
    socket.emit("new message", {
      messageData: base64Url,
      chatId: activeChatId,
      fileType,
      speechToText: results,
    });
  };
  componentWillUnmount = async () => {
    this.props.showHeader(true);
    this.props.removeLoading("CHAT");
    await this.stopRecording();
    Voice.stop();
    this.mounted = false;
  };

  componentDidMount = () => {
    this.props.showHeader(false);
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
    } = this.props;
    const { recording, refreshing } = this.state;
    return (
      <View style={styles.chatPane}>
        <Appbar.Header
          style={[
            styles.appBarHeader,
            {
              position: "absolute",
              top: 0,
              backgroundColor: "white",
            },
          ]}
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
        <View style={styles.messagesParentContainer}>
        <ScrollView
          ref={(view) => {
            this.scrollView = view;
          }}
          onContentSizeChange={() => { 
            const { lastFetched } = this.state;
            !lastFetched && this.scrollView.scrollToEnd({ animated: true })
            }
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                this.mounted && this.setState({ refreshing: true })
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
                  this.mounted && this.setState({ refreshing: false })
                }}
            />
          } 
          contentContainerStyle={styles.messagesContainer}
          scrollEventThrottle={16}
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
                  <Text>
                  {new Date(chat.dateCreated).toString()}
                  </Text>
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
        </View>
        <RecordingControls
          onRecordingStart={(() => {
            this.mounted && this.setState({ recording: true });
          }).bind(this)}
          backButtonAction={this.backButtonAction.bind(this)}
          onSend={this.onSend.bind(this)}
        />
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
});

export default connect(mapStateToProps, {
  hideChats,
  viewMoreChats,
  changeSound,
  pauseSound,
  addLoading,
  removeLoading,
  showHeader,
})(Chat);
