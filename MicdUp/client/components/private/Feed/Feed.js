import React, { Component, Fragment } from "react";
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
import { listStyles, styles, postHeight, small } from "../../../styles/Styles";
// components
import { Title } from "react-native-paper";
import { SwipeListView } from "react-native-swipe-list-view";
import Post from "../Profile/Post";
import { Button } from "react-native-paper";
import Header from "../../reuseable/Header";
// redux
import { getRecordingsFromTag } from "../../../redux/actions/recording";
import {
  addLoading,
  removeLoading,
  navigate,
  showHeader,
} from "../../../redux/actions/display";
import { followTag } from "../../../redux/actions/tag";
import {
  getFollowingFeed,
  getNotLoggedInFeed,
  getTopicsFeed,
} from "../../../redux/actions/feed";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { updateTags } from "../../../redux/actions/recording";
// helpers
import { rollbar } from "../../../reuseableFunctions/constants";

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

  componentWillUnmount = () => {
    this.props.showHeader(true);
    this.mounted = false;
  };

  updateNavigationOptions = (tag) => {
    const { navigation } = this.props;
    this.props.showHeader(false);
    if (!tag) {
      return;
    }
    navigation.setOptions({
      headerTitle: tag.title,
      headerRight: () => (
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-evenly",
            paddingHorizontal: 20,
          }}
        >
          <Header></Header>
          <TouchableOpacity>
            <MaterialCommunityIcons
              color="red"
              size={24}
              name={
                !tag.isFollowedByUser ? "heart-plus-outline" : "heart-remove"
              }
              onPress={async () => {
                const { tag } = this.state;
                this.props.addLoading("Feed");
                const newTag = await this.props.followTag(tag._id);
                this.mounted && this.setState({ tag: newTag });
                if (newTag) {
                  this.updateNavigationOptions(newTag);
                }
                this.props.removeLoading("Feed");
              }}
            />
          </TouchableOpacity>
        </View>
      ),
    });
  };

  getData = async (skipMult) => {
    const { loggedIn, tag, navigation } = this.props;
    const { fromSearch } = this.props.route.params
      ? this.props.route.params
      : {};
    this.props.addLoading("Feed");
    try {
      this.mounted && this.setState({ loading: true });
      if (fromSearch && tag) {
        this.mounted && this.setState({ tag: { ...tag } });
        console.log(skipMult, "Skip Mult");
        this.updateNavigationOptions(tag);
        await this.props.getRecordingsFromTag(tag._id, skipMult);
      } else if (!fromSearch && loggedIn) {
        await this.props.getFollowingFeed(skipMult);
      } else if (!loggedIn) {
        await this.props.getNotLoggedInFeed(skipMult);
      }
      this.mounted && this.setState({ loading: false });
    } catch (err) {}
    this.props.removeLoading("Feed");
  };

  setOuterScroll = (setTo) => {
    this.mounted && this.setState({ outerScrollEnabled: setTo });
  };
  componentDidMount = async () => {
    await this.getData(0);
  };

  componentWillUnmount = () => {
    this.props.removeLoading("Feed");
  };

  componentDidUpdate = async (prevProps) => {
    const { loggedIn, tag } = this.props;
    const tag2 = this.state.tag;
    if (loggedIn && !prevProps.loggedIn) {
      await this.getData(0);
    }

    if (tag && tag2 && tag._id && tag2._id && tag._id !== tag2._id) {
      await this.getData(0);
    }
  };

  async handleScroll(event) {
    const { loggedIn, cachedPosts } = this.props;
    const { loading, tag, prevLength, following } = this.state;
    const { fromSearch } = this.props.route.params
      ? this.props.route.params
      : {};
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
        prevLength !== postsToView.length &&
        Math.round(postsToView.length / 20) > 0
      ) {
        this.mounted && this.setState({ prevLength: postsToView.length });
        await this.getData(Math.round(postsToView.length / 20));
      }
    } catch (err) {
      rollbar.error(err);
    }
  }

  render() {
    const { profile, cachedPosts, loggedIn } = this.props;
    const { loading, tag, following, outerScrollEnabled, refreshing } =
      this.state;
    const { fromSearch } = this.props.route.params
      ? this.props.route.params
      : {};
    const key = fromSearch
      ? tag
        ? tag._id
        : null
      : !loggedIn
      ? "NOTLOGGEDINFEED"
      : following
      ? "FOLLOWINGFEED"
      : "TOPICSFEED";
    const postsToView = key ? cachedPosts[key] : [];

    return (
      <View
        style={{
          display: "flex",
          justifyContent: "flex-start",
          marginTop: height * 0.02,
          overflow: "scroll",
          flex: 1,
        }}
        key={this.props.tag ? this.props.tag.id : this.props.loggedIn}
      >
        {profile && !fromSearch && (
          <View
            style={{
              width,
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-evenly",
              alignItems: "center",
              padding: 20,
            }}
          >
            <TouchableOpacity
              style={
                (styles.nextButton,
                {
                  width: width * 0.35,
                  backgroundColor: following ? "#6FF6FF" : "white",
                  padding: 10,
                  textAlign: "center",
                })
              }
              onPress={async () => {
                if (
                  following ||
                  !cachedPosts["FOLLOWINGFEED"] ||
                  cachedPosts["FOLLOWINGFEED"].length == 0
                ) {
                  this.props.addLoading("Feed");
                  try {
                    this.mounted && this.setState({ loading: true });
                    await this.props.getFollowingFeed(0);
                    this.mounted && this.setState({ loading: false });
                  } catch (err) {
                    rollbar.error(err);
                  }
                  this.props.removeLoading("Feed");
                }
                this.mounted && this.setState({ following: true });
              }}
            >
              <Text
                style={
                  (styles.nextButtonText,
                  {
                    color: "black",
                    fontStyle: "italic",
                    fontSize: small,
                    fontWeight: "600",
                  })
                }
              >
                FOLLOWING
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={
                (styles.nextButton,
                {
                  width: width * 0.35,
                  backgroundColor: !following ? "#6FF6FF" : "white",
                  padding: 10,
                  textAlign: "center",
                })
              }
              onPress={async () => {
                if (
                  !following ||
                  !cachedPosts["TOPICSFEED"] ||
                  cachedPosts["TOPICSFEED"].length == 0
                ) {
                  this.props.addLoading("Feed");
                  try {
                    this.mounted && this.setState({ loading: true });
                    await this.props.getTopicsFeed(0);
                    this.mounted && this.setState({ loading: false });
                  } catch (err) {
                    rollbar.error(err);
                  }
                  this.props.removeLoading("Feed");
                }
                this.mounted && this.setState({ following: false });
              }}
            >
              <Text
                style={
                  (styles.nextButtonText,
                  {
                    color: "black",
                    fontStyle: "italic",
                    fontSize: small,
                    fontWeight: "600",
                  })
                }
              >
                TOPICS
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View
          style={[
            styles.paneUncentered,
            {
              position: "relative",
            },
          ]}
        >
          <SwipeListView
            data={postsToView ? postsToView.filter((n) => n) : []}
            disableRightSwipe
            disableLeftSwipe={!outerScrollEnabled}
            onScroll={this.handleScroll.bind(this)}
            scrollEventThrottle={50}
            useNativeDriver={false}
            scrollEnabled={outerScrollEnabled}
            nestedScrollEnabled={false}
            ListHeaderComponent={() => {
              return !loading && (!postsToView || postsToView.length == 0) ? (
                <Title
                  style={[
                    styles.nextButtonText,
                    { color: "white", paddingTop: 20 },
                  ]}
                >
                  No posts found
                </Title>
              ) : (
                <Fragment></Fragment>
              );
            }}
            refreshControl={
              <RefreshControl
                tintColor="white"
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
                key={data.item.id}
                post={data.item}
                postArray={postsToView}
                currentKey={key}
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
                profile &&
                data.item.owner.id == profile.id && (
                  <View style={listStyles.rowBack}>
                    <TouchableOpacity
                      style={[
                        listStyles.backRightBtn,
                        listStyles.backRightBtnRight,
                      ]}
                      onPress={async () => {
                        this.props.addLoading("Feed");
                        await this.props.deletePost(data.item.id, key);
                        this.props.removeLoading("Feed");
                      }}
                    >
                      <Entypo name="trash" size={24} color="red" />
                    </TouchableOpacity>
                  </View>
                )
              );
            }}
            rightOpenValue={-75}
          />
        </View>
        {fromSearch && (
          <TouchableOpacity
            style={{ display: "flex", alignItems: "center" }}
            onPress={async () => {
              this.props.updateTags(tag.title);
              this.props.navigate("Create");
            }}
          >
            <MaterialCommunityIcons
              name="microphone-plus"
              size={75}
              color="red"
              style={styles.recordingMicIcon}
            />
          </TouchableOpacity>
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
  tag: state.display.tagFromSearch,
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
  showHeader,
  updateTags,
})(Feed);
