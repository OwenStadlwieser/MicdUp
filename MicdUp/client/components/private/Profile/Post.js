import React, { Component } from "react";
import { connect } from "react-redux";
// components
import PlayButton from "../../reuseable/PlayButton";
import { View, Text, TouchableOpacity } from "react-native";
// styles
import { styles } from "../../../styles/Styles";
import { playSound } from "../../../reuseableFunctions/helpers";
export class Post extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      playbackObject: {},
    };

    this.mounted = true;
  }

  stopCurrentSound = async () => {
    const { playbackObject } = this.state;
    if (!playbackObject) return;
    try {
      await playbackObject.stopAsync();
    } catch (err) {}
    this.mounted && this.setState({ playing: "", playingId: "" });
    this.props.setPlaying({});
  };

  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = () => {};

  render() {
    const { post, setPlaying, onPlaybackStatusUpdate, currentSound } =
      this.props;
    return (
      <TouchableOpacity
        onPress={async () => {
          if (currentSound === post.id) {
            await this.stopCurrentSound();
            setPlaying({});
          } else {
            await this.stopCurrentSound();
            const playbackObject = await playSound(
              post.signedUrl,
              onPlaybackStatusUpdate
            );
            this.mounted && this.setState({ playbackObject });
            setPlaying(post.id);
          }
        }}
        style={styles.postContainer}
        key={post.id}
      >
        <Text style={styles.postTitle}>
          {post.title ? post.title : "Untitled"}
        </Text>
        <View style={styles.textAndPlayButtonContainer}>
          <Text style={styles.postText}></Text>
          <PlayButton
            containerStyle={styles.postPlayButton}
            color={"#1A3561"}
            currentPlayingId={currentSound}
            post={post}
            setPlaying={setPlaying}
            onPlaybackStatusUpdate={onPlaybackStatusUpdate}
          />
        </View>
      </TouchableOpacity>
    );
  }
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, {})(Post);
