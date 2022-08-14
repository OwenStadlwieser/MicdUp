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
import { pauseSound, changeSound, trackEnded } from "../../redux/actions/sound";
import { nextTrackIos, prevTrackIos } from "../../reuseableFunctions/constant";
const { width } = Dimensions.get("screen");
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

  nextTrackIos = async () => {
    const { queue, nextIndex } = await nextTrackIos();
    await this.props.trackEnded(
      queue[nextIndex],
      queue,
      nextIndex + 1,
      nextIndex
    );
  };
  prevTrackIos = async () => {
    const { queue, nextIndex } = await prevTrackIos();
    await this.props.trackEnded(
      queue[nextIndex],
      queue,
      nextIndex - 1,
      nextIndex
    );
  };

  render() {
    const { playingId, sound, isPause, profile, queue, currIndex } = this.props;
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
                <View
                  style={{
                    width: width * 0.5,
                    paddingHorizontal: 40,
                    justifyContent: "space-evenly",
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  {currIndex > 0 && (
                    <TouchableOpacity>
                      <AntDesign
                        onPress={this.prevTrackIos}
                        name="stepbackward"
                        size={24}
                        color="black"
                      />
                    </TouchableOpacity>
                  )}

                  {isPause ? (
                    <TouchableOpacity
                      onPress={async () => {
                        let index = queue.findIndex(
                          (el) => el.signedUrl == sound.signedUrl
                        );
                        if (index > 0) {
                          this.props.changeSound(index, queue);
                        } else {
                          await this.props.changeSound(0, [sound]);
                        }
                      }}
                    >
                      <AntDesign
                        name="playcircleo"
                        size={24}
                        color="#000000"
                        style={{ paddingBottom: 30 }}
                      />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={async () => {
                        await this.props.pauseSound();
                      }}
                    >
                      <AntDesign
                        name="pausecircleo"
                        size={24}
                        color="#1A3561"
                        style={{ paddingBottom: 30 }}
                      />
                    </TouchableOpacity>
                  )}
                  {currIndex < queue.length - 1 && (
                    <TouchableOpacity>
                      <AntDesign
                        onPress={this.nextTrackIos}
                        name="stepforward"
                        size={24}
                        color="black"
                      />
                    </TouchableOpacity>
                  )}
                </View>
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
  queue: state.sound.queue,
  currIndex: state.sound.currIndex,
});

export default connect(mapStateToProps, {
  pauseSound,
  changeSound,
  viewProfile,
  searchViewProfile,
  navigate,
  showSoundModal,
  trackEnded,
})(SoundModal);
