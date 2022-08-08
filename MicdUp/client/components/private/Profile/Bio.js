import React, { Component } from "react";
import { connect } from "react-redux";
// components
import { View, TouchableOpacity, Text, Platform } from "react-native";
import PlayButton from "../../reuseable/PlayButton";
// style
import { styles } from "../../../styles/Styles";
// redux
import { uploadBio } from "../../../redux/actions/recording";
import { showMessage } from "../../../redux/actions/display";
// helpers
import { soundBlobToBase64 } from "../../../reuseableFunctions/helpers";
// audio
import Voice from "@react-native-voice/voice";
import {
  onSpeechResults,
  onSpeechStart,
} from "../../../reuseableFunctions/helpers";

export class Bio extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      isRecording: false,
      results: [],
    };
    try {
      Voice.onSpeechResults = onSpeechResults.bind(this);
      Voice.onSpeechStart = onSpeechStart.bind(this);
    } catch (err) {
      console.log(err);
    }
    this.mounted = true;
  }

  componentWillUnmount = async () => {
    this.mounted = false;
    Voice.stop();
    await this.props.stopRecordingBio();
  };

  componentDidMount = () => {};

  uploadBio = async () => {
    const { newBioRecording } = this.props;
    const { results } = this.state;
    if (!newBioRecording || !newBioRecording.uri) {
      this.props.showMessage({
        success: false,
        message: "Please record a bio before saving",
      });
      return;
    }
    const base64Url = await soundBlobToBase64(newBioRecording.uri);
    const res = await this.props.uploadBio(base64Url, newBioRecording.type, [
      JSON.stringify(results),
    ]);
    if (res) this.props.setNewBioRecording({});
  };

  render() {
    const {
      isUserProfile,
      startRecording,
      stopRecordingBio,
      currentSound,
      profile,
      newBioRecording,
      bio,
      id,
    } = this.props;
    const { isRecording } = this.state;
    return (
      <View style={styles.bioContainer}>
        {bio && (
          <View style={styles.bioContainer}>
            <Text style={styles.bioHeader}>Bio</Text>
            <PlayButton
              containerStyle={{}}
              color={"white"}
              currentPlayingId={currentSound}
              size={48}
              post={{
                id: bio.id,
                signedUrl: bio.signedUrl,
              }}
            />
          </View>
        )}
        {isUserProfile && (
          <View style={styles.subBioContainer}>
            <TouchableOpacity
              onPress={async () => {
                if (!isRecording || Platform.OS !== "web") {
                  await startRecording();
                  this.mounted && this.setState({ startTime: Date.now() });
                  try {
                    Platform.OS !== "web" && Voice.start();
                  } catch (err) {}
                  this.mounted && this.setState({ isRecording: true });
                } else {
                  try {
                    Platform.OS !== "web" && Voice.stop();
                  } catch (err) {}
                  await stopRecordingBio();
                  this.mounted && this.setState({ isRecording: false });
                }
              }}
              style={
                newBioRecording.uri ? styles.nextButtonBio : styles.nextButton
              }
            >
              <Text style={styles.nextButtonText}>
                {!newBioRecording.uri &&
                !isRecording &&
                (!bio || !bio.signedUrl)
                  ? "Create Bio"
                  : !newBioRecording.uri && !isRecording
                  ? "Edit Bio"
                  : !isRecording || Platform.OS !== "web"
                  ? "Overwrite"
                  : "Stop Recording"}
              </Text>
            </TouchableOpacity>
            {newBioRecording.uri && (
              <View style={styles.playButtonContainerBio}>
                <PlayButton
                  containerStyle={{}}
                  color={"red"}
                  currentPlayingId={currentSound}
                  post={{
                    id: "NewBioRecording",
                    signedUrl: newBioRecording.uri,
                  }}
                />
              </View>
            )}
            {newBioRecording.uri && (
              <TouchableOpacity
                onPress={async () => {
                  await this.uploadBio();
                }}
                style={styles.nextButtonBio}
              >
                <Text style={styles.nextButtonText}>Save</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.auth.user,
  currentProfile: state.display.viewingProfile,
  profile: state.auth.user.profile,
  bio: state.display.viewingProfile ? state.display.viewingProfile.bio : null,
});

export default connect(mapStateToProps, { uploadBio, showMessage })(Bio);
