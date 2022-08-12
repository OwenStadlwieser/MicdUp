import React, { Component } from "react";
import { connect } from "react-redux";
import { View } from "react-native";
import MusicControl, { Command } from "react-native-music-control";
export class MusicControlCustom extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
    };

    this.mounted = true;
  }

  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = () => {
    MusicControl.enableControl("play", true);
    MusicControl.enableControl("pause", true);
    MusicControl.enableControl("stop", false);
    MusicControl.enableControl("nextTrack", true);
    MusicControl.enableControl("previousTrack", false);

    MusicControl.enableControl("changePlaybackPosition", true);

    MusicControl.enableBackgroundMode(true);

    // on iOS, pause playback during audio interruptions (incoming calls) and resume afterwards.
    // As of {{ INSERT NEXT VERSION HERE}} works for android aswell.
    MusicControl.handleAudioInterruptions(true);

    MusicControl.on(Command.play, () => {
      const { currIndex, queue } = this.props;
      this.props.changeSound(currIndex, queue);
    });

    // on iOS this event will also be triggered by audio router change events
    // happening when headphones are unplugged or a bluetooth audio peripheral disconnects from the device
    MusicControl.on(Command.pause, () => {
      this.props.pauseSound();
    });

    MusicControl.on(Command.stop, () => {
      this.props.pauseSound();
    });

    MusicControl.on(Command.nextTrack, () => {
      const { queue, currIndex } = this.props;
      this.props.changeSound(currIndex + 1, queue);
    });

    MusicControl.on(Command.previousTrack, () => {
      const { queue, currIndex } = this.props;
      this.props.changeSound(currIndex - 1, queue);
    });

    MusicControl.on(Command.changePlaybackPosition, (playbackPosition) => {
      this.props.dispatch(updateRemoteControl(playbackPosition));
    });
  };

  render() {
    return <View></View>;
  }
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, {})(MusicControlCustom);
