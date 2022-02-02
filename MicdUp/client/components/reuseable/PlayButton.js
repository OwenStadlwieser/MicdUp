import React, { Component } from "react";
import { connect } from "react-redux";
import { View } from "react-native";
import { styles } from "../../styles/Styles";
import { AntDesign } from "@expo/vector-icons";
import { changeSound, pauseSound } from "../../redux/actions/sound";
export class PlayButton extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
    };

    this.mounted = true;
  }

  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = () => {};

  stopCurrentSound = async () => {
    const { playbackObject } = this.state;
    if (!playbackObject) return;
    try {
      await playbackObject.stopAsync();
    } catch (err) {}
    this.props.setPlaying({});
    this.props.stopSound && this.props.stopSound();
  };

  render() {
    const {
      containerStyle,
      color,
      post,
      playButtonSty,
      playingId,
      isPause,
      queue,
    } = this.props;
    console.log(post);
    console.log(post.id, playingId, 1);
    return (
      <View
        onStartShouldSetResponder={(event) => true}
        onTouchStart={(e) => {
          e.stopPropagation();
        }}
        style={containerStyle}
      >
        {playingId !== post.id || isPause ? (
          <AntDesign
            onPress={async () => {
              await this.props.changeSound(post, post.signedUrl, queue);
            }}
            style={playButtonSty ? playButtonSty : styles.playButton}
            name="play"
            size={this.props.size ? this.props.size : 24}
            color={color}
          />
        ) : (
          <AntDesign
            onPress={async () => {
              await this.props.pauseSound();
            }}
            style={playButtonSty ? playButtonSty : styles.playButton}
            name="pausecircle"
            size={this.props.size ? this.props.size : 24}
            color={color}
          />
        )}
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  isPause: state.sound.isPause,
  playingId:
    state.sound.currentPlayingSound && state.sound.currentPlayingSound.id,
});

export default connect(mapStateToProps, { changeSound, pauseSound })(
  PlayButton
);
