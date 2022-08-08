import React, { Component } from "react";
import { connect } from "react-redux";
import { View, Text, TouchableOpacity } from "react-native";
// redux
import { likePost } from "../../redux/actions/recording";
import { updateCommentDisplay, likeComment } from "../../redux/actions/comment";
import { addLoading, removeLoading } from "../../redux/actions/display";
// icons
import { AntDesign } from "@expo/vector-icons";
// styles
import { styles } from "../../styles/Styles";
export class Like extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
    };

    this.mounted = true;
  }

  componentWillUnmount = () => {
    this.props.removeLoading("COMMENT");
    this.mounted = false;
  };

  componentDidMount = () => {};

  render() {
    const { post, type, postId, ownerId } = this.props;
    return (
      <View
        onStartShouldSetResponder={(event) => true}
        onTouchStart={(e) => {
          e.stopPropagation();
        }}
        style={styles.likesContainer}
      >
        <View>
          <TouchableOpacity
            onPress={async () => {
              this.props.addLoading("LIKE");
              if (type === "Comment") {
                const newComment = await this.props.likeComment(
                  post.id,
                  post.owner.id
                );
                this.props.updateCommentDisplay(
                  newComment,
                  this.props.parents,
                  { id: postId, owner: { id: ownerId } }
                );
              } else if (type === "Post")
                await this.props.likePost(post.id, this.props.currentKey);
              this.props.removeLoading("LIKE");
            }}
          >
            <AntDesign
              name={post.isLikedByUser ? "heart" : "hearto"}
              size={24}
              color="red"
              style={styles.likes}
            />
          </TouchableOpacity>
          <Text style={styles.likesText}>{post.likes}</Text>
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, {
  likePost,
  likeComment,
  updateCommentDisplay,
  addLoading,
  removeLoading,
})(Like);
