import React, { Component } from "react";
import { connect } from "react-redux";
import { View } from "react-native";
import { styles } from "../../styles/Styles";
import Post from "../private/Profile/Post";
import { SINGLE_POST_KEY } from "../../reuseableFunctions/constants";
export class SinglePostContainer extends Component {
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
    const { post } = this.props;
    return (
      <View
        style={[
          styles.paneUncentered,
          {
            position: "relative",
          },
        ]}
      >
        <Post
          setOuterScroll={() => {}}
          key={post.id}
          post={post}
          postArray={[post]}
          currentKey={SINGLE_POST_KEY}
          index={0}
          canViewPrivate={
            post.owner ? post.owner.canViewPrivatesFromUser : false
          }
          higherUp={false}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  post: state.auth.posts[SINGLE_POST_KEY]
    ? state.auth.posts[SINGLE_POST_KEY][0]
    : {},
});

export default connect(mapStateToProps, {})(SinglePostContainer);
