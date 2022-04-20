import React, { Component } from "react";
import { connect } from "react-redux";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from "react-native";
import { Entypo } from "@expo/vector-icons";
// styles
import { listStyles, styles, postHeight } from "../../../styles/Styles";
// components
import { Appbar, Title } from "react-native-paper";
import { SwipeListView } from "react-native-swipe-list-view";
import Post from "../Profile/Post";
// redux
import { navigate } from "../../../redux/actions/display";
import { getRecordingsFromTag } from "../../../redux/actions/recording";
import { addLoading, removeLoading } from "../../../redux/actions/display";
import { followTag } from "../../../redux/actions/tag";
import {
  getFollowingFeed,
  getNotLoggedInFeed,
  getTopicsFeed,
} from "../../../redux/actions/feed";

const { height, width } = Dimensions.get("window");
export class Feed extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      tag: null,
      prevLength: 0,
      following: true,
      outerScrollEnabled: true,
    };

    this.mounted = true;
  }

  componentWillUnmount = () => (this.mounted = false);

  getData = async (skipMult) => {
    const { fromSearch, tag, loggedIn } = this.props;
    this.props.addLoading("Feed");
    this.mounted && this.setState({ loading: true });
    if (fromSearch && tag) {
      this.mounted && this.setState({ tag: { ...tag } });
      await this.props.getRecordingsFromTag(tag._id, skipMult);
    } else if (!fromSearch && loggedIn) {
      await this.props.getFollowingFeed(skipMult);
    } else if (!loggedIn) {
      await this.props.getNotLoggedInFeed(skipMult);
    }
    this.mounted && this.setState({ loading: false });
    this.props.removeLoading("Feed");
  };

  setOuterScroll = (setTo) => {
    this.mounted && this.setState({ outerScrollEnabled: setTo });
  };
  componentDidMount = async () => {
    await this.getData(0);
  };

  async handleScroll(event) {
    const { fromSearch, loggedIn, cachedPosts } = this.props;
    const { loading, tag, prevLength, following } = this.state;
    const postsToView = fromSearch
      ? tag
        ? cachedPosts[tag._id]
        : []
      : !loggedIn
      ? cachedPosts["NOTLOGGEDINFEED"]
      : following
      ? cachedPosts["FOLLOWINGFEED"]
      : cachedPosts["TOPICSFEED"];
    try {
      if (
        event.nativeEvent.contentOffset.y >
          postsToView.length * postHeight - height &&
        !loading &&
        prevLength !== postsToView.length
      ) {
        this.mounted && this.setState({ prevLength: postsToView.length });
        await this.getData(Math.round(postsToView.length / 20));
      }
    } catch (err) {
      console.log(err);
    }
  }

  render() {
    const { fromSearch, profile, cachedPosts, loggedIn } = this.props;
    const {
      isRecordingComment,
      loading,
      tag,
      following,
      outerScrollEnabled,
      refreshing,
    } = this.state;
    const postsToView = fromSearch
      ? tag
        ? cachedPosts[tag._id]
        : []
      : !loggedIn
      ? cachedPosts["NOTLOGGEDINFEED"]
      : following
      ? cachedPosts["FOLLOWINGFEED"]
      : cachedPosts["TOPICSFEED"];
    return (
      <View
        style={{
          display: "flex",
          justifyContent: "flex-start",
          marginTop: height * 0.1,
          overflow: "scroll",
          flex: 1,
        }}
      >
        {tag ? (
          <Appbar.Header
            style={[
              styles.appBarHeader,
              {
                backgroundColor: "white",
              },
            ]}
          >
            <Appbar.BackAction
              onPress={() => {
                this.props.navigate("Search");
              }}
            />
            <Appbar.Content title={tag.title} subtitle="Topic" />
            <Appbar.Action
              color="red"
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
              {
                position: "relative",
              },
            ]}
          >
            <SwipeListView
              data={postsToView}
              disableRightSwipe
              disableLeftSwipe={!outerScrollEnabled}
              onScroll={this.handleScroll.bind(this)}
              scrollEventThrottle={50}
              useNativeDriver={false}
              scrollEnabled={outerScrollEnabled}
              nestedScrollEnabled={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={async () => {
                    this.mounted && this.setState({ refreshing: true });
                    await this.getData(0);
                    this.mounted && this.setState({ refreshing: false });
                  }}
                />
              }
              renderItem={(data, rowMap) => (
                <Post
                  setOuterScroll={this.setOuterScroll.bind(this)}
                  isRecordingComment={isRecordingComment}
                  key={data.item.id}
                  post={data.item}
                  postArray={postsToView}
                  index={data.index}
                  canViewPrivate={
                    data.item.owner
                      ? data.item.owner.canViewPrivatesFromUser
                      : false
                  }
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
  loggedIn: state.auth.loggedIn,
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
})(Feed);
