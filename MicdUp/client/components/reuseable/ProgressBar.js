import React, { Component } from "react";
import { connect } from "react-redux";
import { View } from "react-native";
import { postHeight, postWidth } from "../../styles/Styles";
export class ProgressBar extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
    };

    this.mounted = true;
  }

  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = () => {};

  render() {
    const { parentId, playingId, time, duration } = this.props;
    if (!parentId || !playingId || !time || !duration || parentId !== playingId)
      return <View></View>;
    return (
      <View
        style={{
          width: postWidth * (time / duration),
          height: postHeight,
          bottom: 0,
          left: 0,
          position: "absolute",
          zIndex: -1,
          backgroundColor: "#6FF6FF",
          borderRadius: 8,
        }}
      ></View>
    );
  }
}

const mapStateToProps = (state) => ({
  playingId:
    state.sound.currentPlayingSound && state.sound.currentPlayingSound.id,
  time: state.sound.time,
  duration: state.sound.duration,
});

export default connect(mapStateToProps, {})(ProgressBar);
