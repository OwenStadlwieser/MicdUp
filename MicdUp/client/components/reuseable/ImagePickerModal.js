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
// icons
import { Entypo } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
// styles
import { styles } from "../../styles/Styles";
const { width, height } = Dimensions.get("window");
export class ImagePickerModal extends Component {
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
          <TouchableOpacity
            onPress={() => {
              this.props.setSelected("camera");
            }}
          >
            <Entypo name="camera" style={styles.largeIcon} color="#1A3561" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              this.props.setSelected("picture");
            }}
          >
            <AntDesign
              name="picture"
              style={styles.largeIcon}
              color="#1A3561"
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, {})(ImagePickerModal);
