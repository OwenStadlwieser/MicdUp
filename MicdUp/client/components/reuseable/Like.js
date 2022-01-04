import React, { Component } from "react";
import { connect } from "react-redux";
import { View, Text, TouchableOpacity } from "react-native";
// redux
import { likePost } from "../../redux/actions/recording";
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

  componentDidMount = () => {};

  render() {
    const { post } = this.props;
    return (
      <View style={styles.likesContainer}>
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
    );
  }
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, { likePost })(Like);
