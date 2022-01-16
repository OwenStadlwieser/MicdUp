import React, { Component } from "react";
import { connect } from "react-redux";
import { ScrollView, View, TextInput } from "react-native";
import { styles } from "../../../styles/Styles";
// icons
import { FontAwesome5 } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
// helpers
import { soundBlobToBase64 } from "../../../reuseableFunctions/helpers";

export class Chat extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      currentPlayingId: "",
      recording: false,
      audioBlobs: false,
    };

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

  componentDidMount = () => {};

  setPlaying(id) {
    this.mounted && this.setState({ playingId: id });
  }

  onPlaybackStatusUpdate(status) {
    if (status.didJustFinish)
      this.mounted && this.setState({ playing: "", playingId: "" });
  }

  render() {
    const { activeChats, activeChatId, profile } = this.props;
    const { currentPlayingId, recording, audioBlobs } = this.state;
    return (
      <View>
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
                            : require("../../assets/no-profile-pic-icon-27.jpg")
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
});

export default connect(mapStateToProps, {})(Chat);
