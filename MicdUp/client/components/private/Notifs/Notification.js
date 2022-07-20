import React, { Component } from "react";
import { connect } from "react-redux";
import { Image, Text, Dimensions } from "react-native";
import { navigate } from "../../../redux/actions/display";
import {
  searchViewProfile,
  showComments,
} from "../../../redux/actions/display";
import { openSpecificPost } from "../../../redux/actions/recording";
import { viewProfile } from "../../../redux/actions/display";
import { styles, medium } from "../../../styles/Styles";
import { NotificationTypesFrontend } from "../../../notifications/NotificationTypes";
import { TouchableOpacity } from "react-native-gesture-handler";
import { SINGLE_POST_KEY } from "../../../reuseableFunctions/constants";
export class Notification extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
    };

    this.mounted = true;
  }

  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = async () => {};

  render() {
    const { data, profile } = this.props;
    const { sender, text, itemId, parentId } = data;
    console.log(data);
    return (
      <TouchableOpacity
        style={styles.notif}
        onPress={async () => {
          switch (data.type) {
            case NotificationTypesFrontend.LikePost:
              await this.props.openSpecificPost(itemId, null);
              this.props.navigate("SinglePostContainer");
              break;
            case NotificationTypesFrontend.CommentPost:
              await this.props.openSpecificPost(parentId, itemId);
              this.props.navigate("SinglePostContainer");
              this.props.showComments(0, SINGLE_POST_KEY);
              break;
            case NotificationTypesFrontend.Follow:
              if (profile && profile.id === sender.id) {
                this.props.navigate("Profile");
                this.mounted && this.setState({ showing: false });
                return;
              }
              this.props.viewProfile({ ...sender });
              this.props.searchViewProfile(true);
              this.props.navigate("SearchProfile");
              break;
            case NotificationTypesFrontend.ReplyComment:
              await this.props.openSpecificPost(parentId, itemId);
              this.props.navigate("SinglePostContainer");
              this.props.showComments(0, SINGLE_POST_KEY);
              break;
            case NotificationTypesFrontend.LikeComment:
              await this.props.openSpecificPost(parentId, itemId);
              this.props.navigate("SinglePostContainer");
              this.props.showComments(0, SINGLE_POST_KEY);
              break;
          }
        }}
      >
        <Image
          source={
            sender && sender.image
              ? {
                  uri: sender.image.signedUrl,
                }
              : require("../../../assets/no-profile-pic-icon-27.jpg")
          }
          style={styles.commentImg}
        />
        <Text style={{ fontSize: medium, fontWeight: "500", color: "#000000" }}>
          {text}
        </Text>
      </TouchableOpacity>
    );
  }
}

const mapStateToProps = (state) => ({
  mountedComponent: state.display.mountedComponent,
  profile: state.auth.user.profile,
});

export default connect(mapStateToProps, {
  navigate,
  searchViewProfile,
  viewProfile,
  openSpecificPost,
  showComments,
})(Notification);
