import React, { Component } from "react";
import { connect } from "react-redux";
import { View, Platform } from "react-native";
// styles
import { listStyles } from "../../../styles/Styles";
// components
import { SwipeListView } from "react-native-swipe-list-view";
import Post from "../Profile/Post";
// redux
import { getRecordingsFromTag } from "../../../redux/actions/recording";
import { addLoading, removeLoading } from "../../../redux/actions/display";
export class Feed extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
    };

    this.mounted = true;
  }

  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = async () => {
    const { fromSearch, tag } = this.props;
    if (fromSearch && tag) {
      this.props.addLoading("Feed");
      await this.props.getRecordingsFromTag(tag);
      this.props.removeLoading("Feed");
    }
  };

  async handleScroll(event) {}

  render() {
    const { posts } = this.props;
    const { isRecordingComment } = this.state;
    return (
      <View>
        <SwipeListView
          data={posts}
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
})(Feed);
