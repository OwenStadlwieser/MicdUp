import React, { Component } from "react";
import { connect } from "react-redux";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Entypo } from "@expo/vector-icons";
// styles
import { listStyles, styles } from "../../../styles/Styles";
// components
import { Appbar, Title } from "react-native-paper";
import { SwipeListView } from "react-native-swipe-list-view";
import Post from "../Profile/Post";
// redux
import { navigate } from "../../../redux/actions/display";
import { getRecordingsFromTag } from "../../../redux/actions/recording";
import {
  addLoading,
  removeLoading,
  setCurrentKey,
} from "../../../redux/actions/display";
import { followTag } from "../../../redux/actions/tag";
import {
  getFollowingFeed,
  getNotLoggedInFeed,
  getTopicsFeed,
} from "../../../redux/actions/feed";

export class Feed extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      tag: null,
      following: true,
    };

    this.mounted = true;
  }

  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = async () => {
    const { fromSearch, tag, profile } = this.props;
    if (fromSearch && tag) {
      this.mounted && this.setState({ tag: { ...tag } });
      this.props.addLoading("Feed");
      this.mounted && this.setState({ loading: true });
      this.props.setCurrentKey(tag._id);
      await this.props.getRecordingsFromTag(tag._id);
      this.mounted && this.setState({ loading: false });
      this.props.removeLoading("Feed");
    } else if (!fromSearch && profile) {
      this.props.addLoading("Feed");
      this.mounted && this.setState({ loading: true });
      this.props.setCurrentKey("FOLLOWINGFEED");
      await this.props.getFollowingFeed(0);
      this.mounted && this.setState({ loading: false });
      this.props.removeLoading("Feed");
    } else if (!profile) {
      this.props.addLoading("Feed");
      this.mounted && this.setState({ loading: true });
      this.props.setCurrentKey("NOTLOGGEDINFEED");
      await this.props.getNotLoggedInFeed(0);
      this.mounted && this.setState({ loading: false });
      this.props.removeLoading("Feed");
    }
  };

  async handleScroll(event) {}

  render() {
    const { height, width } = Dimensions.get("window");
    const { fromSearch, profile, cachedPosts } = this.props;
    const { isRecordingComment, loading, tag, following } = this.state;
    const postsToView = fromSearch
      ? tag
        ? cachedPosts[tag._id]
        : []
      : !profile
      ? cachedPosts["NOTLOGGEDINFEED"]
      : following
      ? cachedPosts["FOLLOWINGFEED"]
      : cachedPosts["TOPICSFEED"];
    return (
      <View
        style={{
          position: "absolute",
          display: "flex",
          justifyContent: "flex-start",
          top: height * 0.1,
          left: 0,
        }}
      >
        {tag ? (
          <Appbar.Header
            style={{
              backgroundColor: "white",
              width,
              height: height * 0.1,
              zIndex: 2,
            }}
          >
            <Appbar.BackAction
              onPress={() => {
                this.props.navigate("Search");
              }}
            />
            <Appbar.Content title={tag.title} subtitle="Topic" />
            <Appbar.Action
              icon={
                !tag.isFollowedByUser ? "heart-plus-outline" : "heart-remove"
              }
              onPress={async () => {
                this.props.addLoading("Feed");
                const newTag = await this.props.followTag(tag._id);
                this.mounted && this.setState({ tag: newTag });
                this.props.removeLoading("Feed");
              }}
            />
          </Appbar.Header>
        ) : (
          profile && (
            <View
              style={{
                width,
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Title
                style={
                  (styles.nextButtonText,
                  {
                    color: following ? "#6FF6FF" : "white",
                    paddingRight: 10,
                    borderRightColor: "white",
                    borderRightWidth: 2,
                  })
                }
                onPress={async () => {
                  this.props.setCurrentKey("FOLLOWINGFEED");
                  if (
                    following ||
                    !cachedPosts["FOLLOWINGFEED"] ||
                    cachedPosts["FOLLOWINGFEED"].length == 0
                  ) {
                    this.props.addLoading("Feed");
                    this.mounted && this.setState({ loading: true });
                    await this.props.getFollowingFeed(0);
                    this.mounted && this.setState({ loading: false });
                    this.props.removeLoading("Feed");
                  }
                  this.mounted && this.setState({ following: true });
                }}
              >
                FOLLOWING
              </Title>
              <Title
                style={
                  (styles.nextButtonText,
                  { color: !following ? "#6FF6FF" : "white", paddingLeft: 10 })
                }
                onPress={async () => {
                  this.props.setCurrentKey("TOPICSFEED");
                  if (
                    !following ||
                    !cachedPosts["TOPICSFEED"] ||
                    cachedPosts["TOPICSFEED"].length == 0
                  ) {
                    this.props.addLoading("Feed");
                    this.mounted && this.setState({ loading: true });
                    await this.props.getTopicsFeed(0);
                    this.mounted && this.setState({ loading: false });
                    this.props.removeLoading("Feed");
                  }
                  this.mounted && this.setState({ following: false });
                }}
              >
                TOPICS
              </Title>
            </View>
          )
        )}
        {!loading && (!postsToView || postsToView.length == 0) ? (
          <Text
            style={[styles.nextButtonText, { color: "white", paddingTop: 20 }]}
          >
            No posts found
          </Text>
        ) : (
          <View
            style={[
              styles.paneUncentered,
              { overflow: "scroll", position: "relative" },
            ]}
          >
            <SwipeListView
              data={postsToView}
              disableRightSwipe
              disableLeftSwipe={false}
              onScroll={this.handleScroll.bind(this)}
              scrollEventThrottle={50}
              useNativeDriver={false}
              renderItem={(data, rowMap) => (
                <Post
                  isRecordingComment={isRecordingComment}
                  key={data.item.id}
                  post={data.item}
                  postArray={postsToView}
                  index={data.index}
                  canViewPrivate={true}
                  higherUp={false}
                />
              )}
              renderHiddenItem={(data, rowMap) => {
                return (
                  <View style={listStyles.rowBack}>
                    <TouchableOpacity
                      style={[
                        listStyles.backRightBtn,
                        listStyles.backRightBtnRight,
                      ]}
                      onPress={async () => {
                        await this.props.deletePost(data.item.id);
                      }}
                    >
                      <Entypo name="trash" size={24} color="red" />
                    </TouchableOpacity>
                  </View>
                );
              }}
              rightOpenValue={-75}
            />
          </View>
        )}
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.auth.user,
  profile: state.auth.user.profile,
  cachedPosts: state.auth.posts,
});

export default connect(mapStateToProps, {
  getRecordingsFromTag,
  addLoading,
  removeLoading,
  navigate,
  followTag,
  getFollowingFeed,
  getNotLoggedInFeed,
  getTopicsFeed,
  setCurrentKey,
})(Feed);
