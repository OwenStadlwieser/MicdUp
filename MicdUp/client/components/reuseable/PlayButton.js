import React, { Component } from "react";
import { connect } from "react-redux";
import { View } from "react-native";
import { styles } from "../../styles/Styles";
import { playSound } from "../../reuseableFunctions/helpers";
import { AntDesign } from "@expo/vector-icons";
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
      currentPlayingId,
      post,
      setPlaying,
      onPlaybackStatusUpdate,
    } = this.props;
    return (
      <View
        onStartShouldSetResponder={(event) => true}
        onTouchStart={(e) => {
          e.stopPropagation();
        }}
        style={containerStyle}
      >
        {currentPlayingId !== post.id ? (
          <AntDesign
            onPress={async () => {
              await this.stopCurrentSound();
              const playbackObject = await playSound(
                post.signedUrl,
                onPlaybackStatusUpdate
              );
              this.mounted && this.setState({ playbackObject });
              setPlaying(post.id);
            }}
            style={styles.playButton}
            name="play"
            size={this.props.size ? this.props.size : 24}
            color={color}
          />
        ) : (
          <AntDesign
            onPress={async () => {
              await this.stopCurrentSound();
            }}
            style={styles.playButton}
            name="pausecircle"
            size={this.props.size ? this.props.size : 24}
            color={color}
          />
        )}
      </View>
    );
  }
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, {})(PlayButton);
