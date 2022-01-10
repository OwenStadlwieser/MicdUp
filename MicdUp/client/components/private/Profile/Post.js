import React, { Component } from "react";
import { connect } from "react-redux";
// components
import PlayButton from "../../reuseable/PlayButton";
import Like from "../../reuseable/Like";
import Comment from "../../reuseable/Comment";
import { View, Text, TouchableOpacity } from "react-native";
// styles
import { FontAwesome } from "@expo/vector-icons";
import { styles } from "../../../styles/Styles";
import { playSound } from "../../../reuseableFunctions/helpers";
//icons
import { Feather } from "@expo/vector-icons";
//redux
import { deletePost, updatePosts } from "../../../redux/actions/recording";

export class Post extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      playbackObject: {},
      commentsShowing: false,
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

  setCommentsShowing = (commentsShowing) => {
    this.mounted && this.setState({ commentsShowing });
  };
  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = () => {};

  deleteItem = (postArray, index) => {
    console.log("Props posts: ", postArray);
    postArray.splice(index, 1);
    this.props.updatePosts(postArray);
  };

  render() {
    const {
      post,
      postArray,
      setPlaying,
      onPlaybackStatusUpdate,
      currentSound,
      setCommentPosts,
      removeCommentPosts,
      higherUp,
      index,
    } = this.props;
    const { commentsShowing } = this.state;
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
        style={
          commentsShowing ? styles.higherPostContainer : styles.postContainer
        }
        key={post.id}
      >
        <Text style={styles.postTitle}>
          {post.title ? post.title : "Untitled"}
        </Text>
        <Comment
          containerStyle={{}}
          setCommentPosts={setCommentPosts}
          removeCommentPosts={removeCommentPosts}
          color={"#1A3561"}
          currentPlayingId={currentSound}
          post={post}
          isShowing={commentsShowing}
          setCommentsShowing={this.setCommentsShowing.bind(this)}
          setPlaying={setPlaying}
          index={index}
          onPlaybackStatusUpdate={onPlaybackStatusUpdate}
        />
        <View style={styles.textAndPlayButtonContainer}>
          <Text style={styles.postText}></Text>
          <View style={styles.postPlayButton}>
            <Like post={post} type={"Post"} />
            <TouchableOpacity
              onPress={() => {
                setCommentPosts(post, index);
                this.mounted && this.setState({ commentsShowing: true });
              }}
            >
              <FontAwesome name="comment" size={24} color="black" />
            </TouchableOpacity>
            <PlayButton
              containerStyle={{}}
              color={"#1A3561"}
              currentPlayingId={currentSound}
              post={post}
              setPlaying={setPlaying}
              onPlaybackStatusUpdate={onPlaybackStatusUpdate}
            />
            <Feather
              onPress={async () => {
                this.deleteItem(this.props.postArray, this.props.index);
                await this.props.deletePost(post.id);
              }}
              name="scissors"
              size={24}
              color="red"
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

const mapStateToProps = (state) => ({
  posts: state.recording.posts,
});

export default connect(mapStateToProps, { deletePost, updatePosts })(Post);
