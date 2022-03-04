import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import {
  View,
  TouchableWithoutFeedback,
  Dimensions,
  TouchableOpacity,
  TouchableHighlight,
} from "react-native";
import { Text, Title } from "react-native-paper";
import { AntDesign } from "@expo/vector-icons";
import { styles } from "../../styles/Styles";
import ProgressBar from "./ProgressBar";
// redux
import { pauseSound, changeSound } from "../../redux/actions/sound";
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
    const { playingId, sound, isPause } = this.props;
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
              <Fragment>
                <Title>{sound.title}</Title>
                {isPause ? (
                  <AntDesign
                    onPress={async () => {
                      await this.props.changeSound(sound, sound.signedUrl);
                    }}
                    name="playcircleo"
                    size={24}
                    color="#1A3561"
                  />
                ) : (
                  <AntDesign
                    onPress={async () => {
                      await this.props.pauseSound();
                    }}
                    name="pausecircleo"
                    size={24}
                    color="1A3561"
                  />
                )}
                <ProgressBar
                  parentId={playingId}
                  height={10}
                  width={width * 0.5}
                />
              </Fragment>
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
});

export default connect(mapStateToProps, { pauseSound, changeSound })(
  SoundPlayer
);
