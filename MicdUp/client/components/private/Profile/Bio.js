import React, { Component } from "react";
import { connect } from "react-redux";
// components
import { View, TouchableOpacity, Text } from "react-native";
import PlayButton from "../../reuseable/PlayButton";
// style
import { styles } from "../../../styles/Styles";
// redux
import { uploadBio } from "../../../redux/actions/recording";
import { showMessage } from "../../../redux/actions/display";
// helpers
import { soundBlobToBase64 } from "../../../reuseableFunctions/helpers";
export class Bio extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      isRecording: false,
    };

    this.mounted = true;
  }

  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = () => {};

  uploadBio = async () => {
    const { newBioRecording } = this.props;
    if (!newBioRecording || !newBioRecording.uri) {
      this.props.showMessage({
        success: false,
        message: "Please record a bio before saving",
      });
      return;
    }
    const base64Url = await soundBlobToBase64(newBioRecording.uri);
    const res = await this.props.uploadBio(base64Url, newBioRecording.type);
    if (res) this.props.setNewBioRecording({});
  };

  render() {
    const {
      currentProfile,
      startRecording,
      stopRecordingBio,
      currentSound,
      onPlaybackStatusUpdate,
      setPlaying,
      profile,
      newBioRecording,
      bio,
    } = this.props;
    const { isRecording } = this.state;
    const isUserProfile = profile.id === currentProfile.id;
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
              setPlaying={setPlaying}
              onPlaybackStatusUpdate={onPlaybackStatusUpdate}
            />
          </View>
        )}
        {isUserProfile && (
          <View style={styles.subBioContainer}>
            <TouchableOpacity
              onPress={async () => {
                if (!isRecording) {
                  await startRecording();
                  this.mounted && this.setState({ isRecording: true });
                } else {
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
                  : !isRecording
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
                  setPlaying={setPlaying}
                  onPlaybackStatusUpdate={onPlaybackStatusUpdate}
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
