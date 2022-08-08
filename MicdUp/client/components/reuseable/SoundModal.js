import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import {
  View,
  TouchableOpacity,
  TouchableHighlight,
  Image,
  Dimensions,
} from "react-native";
import { Text, Title } from "react-native-paper";
import { AntDesign } from "@expo/vector-icons";
import { styles } from "../../styles/Styles";
import ProgressBar from "./ProgressBar";
// redux
import {
  viewProfile,
  searchViewProfile,
  navigate,
  showSoundModal,
} from "../../redux/actions/display";
import { pauseSound, changeSound } from "../../redux/actions/sound";

const { width, height } = Dimensions.get("screen");
export class SoundModal extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
    };

    this.mounted = true;
  }

  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = () => {};

  componentDidUpdate = (prevProps) => {};
  render() {
    const { playingId, sound, isPause, profile } = this.props;
    return (
      <TouchableOpacity
        onPress={() => {
          this.props.showSoundModal(false);
        }}
        style={styles.modalContainer}
      >
        <TouchableHighlight
          onPress={() => {}}
          underlayColor="white"
          style={[styles.modalMainContainer, { padding: 20 }]}
        >
          <Fragment>
            {sound && sound.owner ? (
              <View
                style={{
                  flexDirection: "column",
                  width: width * 0.5,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onPress={() => {
                    if (profile && profile.id === sound.owner.id) {
                      this.props.navigate("Profile");
                      this.mounted && this.setState({ showing: false });
                      return;
                    }
                    this.props.viewProfile({ ...sound.owner });
                    this.props.searchViewProfile(true);
                    this.mounted && this.setState({ showing: false });
                    this.props.navigate("SearchProfile");
                  }}
                >
                  <Image
                    source={
                      sound.owner.image
                        ? {
                            uri: sound.owner.image.signedUrl,
                          }
                        : require("../../assets/no-profile-pic-icon-27.jpg")
                    }
                    style={styles.listItemProfileImg}
                  />
                  <Text style={styles.listItemTextUser}>
                    {sound.owner.user.userName}
                  </Text>
                </TouchableOpacity>
                <View>
                  <Title>{sound.title}</Title>
                </View>
                {isPause ? (
                  <AntDesign
                    onPress={async () => {
                      await this.props.changeSound(sound, sound.signedUrl);
                    }}
                    name="playcircleo"
                    size={24}
                    color="#000000"
                    style={{ paddingBottom: 30 }}
                  />
                ) : (
                  <AntDesign
                    onPress={async () => {
                      await this.props.pauseSound();
                    }}
                    name="pausecircleo"
                    size={24}
                    color="1A3561"
                    style={{ paddingBottom: 30 }}
                  />
                )}
                <ProgressBar
                  parentId={playingId}
                  height={10}
                  width={width * 0.5}
                />
              </View>
            ) : (
              <Text>No sound playing</Text>
            )}
          </Fragment>
        </TouchableHighlight>
      </TouchableOpacity>
    );
  }
}

const mapStateToProps = (state) => ({
  playingId:
    state.sound.currentPlayingSound && state.sound.currentPlayingSound.id,
  sound: state.sound.currentPlayingSound,
  isPause: state.sound.isPause,
  profile: state.auth.user ? state.auth.user.profile : null,
});

export default connect(mapStateToProps, {
  pauseSound,
  changeSound,
  viewProfile,
  searchViewProfile,
  navigate,
  showSoundModal,
})(SoundModal);
