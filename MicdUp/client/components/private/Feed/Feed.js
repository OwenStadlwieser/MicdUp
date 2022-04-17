import React, { Component } from "react";
import { connect } from "react-redux";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Entypo } from "@expo/vector-icons";
// styles
import { listStyles, styles } from "../../../styles/Styles";
// components
import { Appbar } from "react-native-paper";
import { SwipeListView } from "react-native-swipe-list-view";
import Post from "../Profile/Post";
// redux
import { navigate } from "../../../redux/actions/display";
import { getRecordingsFromTag } from "../../../redux/actions/recording";
import { addLoading, removeLoading } from "../../../redux/actions/display";
import { followTag } from "../../../redux/actions/tag";

export class Feed extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      tag: null,
    };

    this.mounted = true;
  }

  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = async () => {
    const { fromSearch, tag } = this.props;
    if (fromSearch && tag) {
      this.mounted && this.setState({ tag: { ...tag } });
      this.props.addLoading("Feed");
      this.mounted && this.setState({ loading: true });
      await this.props.getRecordingsFromTag(tag._id);
      this.mounted && this.setState({ loading: false });
      this.props.removeLoading("Feed");
    }
  };

  async handleScroll(event) {}

  render() {
    const { height, width } = Dimensions.get("window");
    const { posts } = this.props;
    const { isRecordingComment, loading, tag } = this.state;
    return (
      <View
        style={{
          position: "absolute",
          display: "flex",
          justifyContent: "flex-start",
          top: height * 0.1,
        }}
      >
        {tag && (
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
                console.log(newTag);
                this.mounted && this.setState({ tag: newTag });
                this.props.removeLoading("Feed");
              }}
            />
          </Appbar.Header>
        )}
        {!loading && posts.length == 0 ? (
          <Text style={[styles.nextButtonText, { color: "white" }]}>
            No posts found
          </Text>
        ) : (
          <SwipeListView
            data={posts}
            disableRightSwipe
            disableLeftSwipe={false}
            onScroll={this.handleScroll.bind(this)}
            scrollEventThrottle={50}
            style={{ marginTop: 40 }}
            useNativeDriver={false}
            renderItem={(data, rowMap) => (
              <Post
                isRecordingComment={isRecordingComment}
                key={data.item.id}
                post={data.item}
                postArray={posts}
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
        )}
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.auth.user,
  profile: state.auth.user.profile,
  posts: state.display.viewingPosts,
});

export default connect(mapStateToProps, {
  getRecordingsFromTag,
  addLoading,
  removeLoading,
  navigate,
  followTag,
})(Feed);
