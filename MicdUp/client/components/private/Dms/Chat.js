import React, { Component } from "react";
import { connect } from "react-redux";
import {
  ScrollView,
  View,
  Platform,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Appbar } from "react-native-paper";
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
import { hideChats } from "../../../redux/actions/chat";

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
    };
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
    const { currentPlayingId, recording, audioBlobs, v } = this.state;
    console.log(activeChats);
    return (
      <View>
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
        <ScrollView style={styles.messagesContainer}>
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
                <View style={styles.chatContainerOne}>
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
                        <Like type={"Chat"} postId={this.props.chat.id} />
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
                  const base64Url = await soundBlobToBase64(audioBlobs.uri);
                  if (base64Url != null) {
                    fileType = audioBlobs.type;
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
  profile: state.auth.profile,
  activeChatMembers: state.chat.activeChatMembers,
  userName: state.auth.user.userName,
});

export default connect(mapStateToProps, { hideChats })(Chat);
