import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import {
  View,
  TouchableWithoutFeedback,
  Dimensions,
  TouchableOpacity,
  TouchableHighlight,
  Image,
} from "react-native";
import { Text, Title } from "react-native-paper";
import { AntDesign } from "@expo/vector-icons";
import { styles } from "../../styles/Styles";
import ProgressBar from "./ProgressBar";
// redux
import { viewProfile, searchViewProfile } from "../../redux/actions/display";
import { pauseSound, changeSound } from "../../redux/actions/sound";
import { navigate } from "../../redux/actions/display";

const { height, width } = Dimensions.get("screen");
export class SoundPlayer extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      showing: false,
    };

    this.mounted = true;
  }

  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = () => {};

  render() {
    const { showing } = this.state;
    const { playingId, sound, isPause, profile } = this.props;
    console.log(sound && sound.owner);
    return showing ? (
      <TouchableOpacity
        onPress={() => {
          this.mounted && this.setState({ showing: false });
        }}
        style={styles.modalContainer}
      >
        <TouchableHighlight
          onPress={() => {}}
          underlayColor="white"
          style={[styles.modalMainContainer, { padding: 20 }]}
        >
          <Fragment>
            {sound && (
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
                      return;
                    }
                    this.props.navigate("Search");
                    this.props.viewProfile(sound.owner);
                    this.props.searchViewProfile(true);
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
                    color="#1A3561"
                    style={{ paddingBottom: 10 }}
                  />
                ) : (
                  <AntDesign
                    onPress={async () => {
                      await this.props.pauseSound();
                    }}
                    name="pausecircleo"
                    size={24}
                    color="1A3561"
                    style={{ paddingBottom: 10 }}
                  />
                )}
                <ProgressBar
                  parentId={playingId}
                  height={10}
                  width={width * 0.5}
                />
              </View>
            )}
          </Fragment>
        </TouchableHighlight>
      </TouchableOpacity>
    ) : (
      <View style={[styles.toptopLeftIcon, { zIndex: 50 }]}>
        <AntDesign
          onPress={() => {
            this.mounted && this.setState({ showing: true });
          }}
          name="sound"
          size={24}
          color="white"
        />
      </View>
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
})(SoundPlayer);
