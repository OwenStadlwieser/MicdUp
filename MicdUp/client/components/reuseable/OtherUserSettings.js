import React, { Component } from "react";
import { connect } from "react-redux";
// components
import Modal from "react-native-modal";
import {
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
} from "react-native";
import { Button } from "react-native-paper";
// redux
import { addLoading, removeLoading } from "../../redux/actions/display";
import { blockProfile } from "../../redux/actions/profile";
import { showMessage } from "../../redux/actions/display";
// icons
import { Entypo } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
// styles
import { styles } from "../../styles/Styles";
const { width, height } = Dimensions.get("window");
export class OtherUserSetttings extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      blocking: true,
    };

    this.mounted = true;
  }

  componentWillUnmount = () => {
    this.props.removeLoading("OTHERSETTING");
    this.mounted = false;
  };

  componentDidMount = () => {};

  handleClickOutside = (evt) => {
    this.props.setHidden();
  };

  render() {
    const { profile } = this.props;
    return (
      <TouchableOpacity
        onPress={() => {
          this.handleClickOutside();
        }}
        style={styles.modalContainer}
      >
        <TouchableOpacity onPress={() => {}} style={styles.modalMainContainer}>
          <Button
            color="red"
            style={[styles.button, { width: "auto", marginTop: 0 }]}
            onPress={async () => {
              if (!this.props.profile) {
                this.props.showMessage({
                  success: false,
                  message: "Log in to block users",
                });
                return;
              }
              this.props.addLoading("OTHERSETTING");
              await this.props.blockProfile(
                this.props.currentProfile.id,
                !this.props.currentProfile.isBlockedByUser
              );
              this.props.removeLoading("OTHERSETTING");
            }}
          >
            {this.props.currentProfile.isBlockedByUser ? "Unblock" : "Block"}{" "}
            {this.props.userName}
          </Button>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }
}

const mapStateToProps = (state) => ({
  profile: state.auth.user.profile,
});

export default connect(mapStateToProps, {
  addLoading,
  removeLoading,
  blockProfile,
  showMessage,
})(OtherUserSetttings);
