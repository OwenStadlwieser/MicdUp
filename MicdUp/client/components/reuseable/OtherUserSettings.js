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

  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = () => {};

  handleClickOutside = (evt) => {
    this.props.setHidden();
  };

  render() {
    const { blocking } = this.state;
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
            onPress={() => {
              this.props.blockProfile(this.props.currentProfile.id, blocking);
            }}
          >
            Block {this.props.userName}
          </Button>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, {
  addLoading,
  removeLoading,
  blockProfile,
})(OtherUserSetttings);
