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
import { Button } from 'react-native-paper';
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
    };

    this.mounted = true;
  }

  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = () => {};

  handleClickOutside = (evt) => {
    this.props.setHidden();
  };

  render() {
    return (
      <TouchableOpacity
        onPress={() => {
          this.handleClickOutside();
        }}
        style={styles.modalContainer}
      >
        <TouchableOpacity onPress={() => {}} style={styles.modalMainContainer}>
          <Button
            onPress={() => {
              this.props.blockUser(this.props.user._id);
            }}
          >
            Block {this.props.user.userName}
          </Button>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, {})(OtherUserSetttings);
