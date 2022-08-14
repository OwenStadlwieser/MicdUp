import React, { Component } from "react";
import { connect } from "react-redux";
import { Image, Text, View } from "react-native";
import { navigate } from "../../../redux/actions/display";
import {
  searchViewProfile,
  showComments,
} from "../../../redux/actions/display";
import { openSpecificPost } from "../../../redux/actions/recording";
import {
  viewProfile,
  addLoading,
  removeLoading,
} from "../../../redux/actions/display";
import { styles, medium } from "../../../styles/Styles";
import { NotificationTypesFrontend } from "../../../notifications/NotificationTypes";
import { TouchableOpacity } from "react-native-gesture-handler";
import { SINGLE_POST_KEY } from "../../../reuseableFunctions/constants";
import { createOrOpenChat } from "../../../redux/actions/chat";
import { CircleSnail } from "react-native-progress";
import { forHumans, getCurrentTime } from "../../../reuseableFunctions/helpers";
import { notificationAppResponse } from "../../../notifications/helpers";
export class Notification extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
    };

    this.mounted = true;
  }

  LOADING_STRING = "NOTIFICATIONLOADING";

  componentWillUnmount = () => {
    this.props.removeLoading(this.LOADING_STRING);
    this.mounted = false;
  };

  componentDidMount = async () => {};

  render() {
    const { data, profile } = this.props;
    const { sender, text, itemId, parentId, dateCreated } = data;
    const { loading } = this.state;
    return (
      <TouchableOpacity
        style={styles.notif}
        onPress={async () => {
          this.mounted && this.setState({ loading: true });

          await notificationAppResponse(data);
          this.mounted && this.setState({ loading: false });
        }}
      >
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
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
          {loading && <CircleSnail color={["black", "#6FF6FF"]} />}
          <Text
            style={{
              fontSize: medium,
              fontWeight: "500",
              color: "#000000",
              paddingLeft: 20,
            }}
          >
            {text}
          </Text>
        </View>
        <Text style={{ fontSize: medium, fontWeight: "500", color: "#000000" }}>
          {forHumans(getCurrentTime() - dateCreated)} Ago
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
  createOrOpenChat,
  addLoading,
  removeLoading,
})(Notification);
