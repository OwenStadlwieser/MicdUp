import React, { Component } from "react";
import { connect } from "react-redux";
import { View, Text, TouchableOpacity } from "react-native";
// redux
import { likePost, likeComment } from "../../redux/actions/recording";
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

  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = () => { };

  render() {
    const { post, comment } = this.props;
    return (
      <View onStartShouldSetResponder={(event) => true}
        onTouchStart={(e) => {
          e.stopPropagation();
        }} style={styles.likesContainer}>
        { post && post.id && (
          <View>
            <TouchableOpacity onPress={() => this.props.likePost(post.id)}>
              <AntDesign
                name={post.isLikedByUser ? "heart" : "hearto"}
                size={24}
                color="red"
                style={styles.likes}
              />
            </TouchableOpacity>
            <Text style={styles.likesText}>{post.likes}</Text>
          </View>
        )}
        { comment && comment.id && (
          <View>
            <TouchableOpacity onPress={() => this.props.likeComment(comment.id)}>
              <AntDesign
                name={comment.isLikedByUser ? "heart" : "hearto"}
                size={24}
                color="red"
                style={styles.likes}
              />
            </TouchableOpacity>
            <Text style={styles.likesText}>{comment.likes}</Text>
          </View>
        )}
      </View>
    );
  }
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, { likePost, likeComment })(Like);
