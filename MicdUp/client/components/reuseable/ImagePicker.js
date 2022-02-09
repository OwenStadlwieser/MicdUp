import React, { Component } from "react";
import { connect } from "react-redux";
//components
import * as ImagePicker from "expo-image-picker";
import ImagePickerModal from "./ImagePickerModal";
// redux
import { showMessage } from "../../redux/actions/display";
// styles
import { styles } from "../../styles/Styles";

export class ImagePickerCustom extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      cameraPermission: {},
      mediaPermission: {},
      isVisible: true,
    };

    this.mounted = true;
  }

  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = async () => {
    const mediaPermission = await ImagePicker.getMediaLibraryPermissionsAsync();
    const cameraPermission = await ImagePicker.getCameraPermissionsAsync();
    this.mounted && this.setState({ mediaPermission, cameraPermission });
    if (!mediaPermission.granted && !cameraPermission.granted) {
      this.props.showMessage({
        success: false,
        message: "Please allow access to media to upload a profile picture",
      });
    }
  };

  setSelected = async (string) => {
    const { cameraPermission, mediaPermission } = this.state;
    let res = {};
    if (string === "camera") {
      if (!cameraPermission.granted) {
        let res = await ImagePicker.requestCameraPermissionsAsync();
        if (res.granted === "none") {
          this.props.setHidden();
          return;
        }
      }
      res = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: true,
      });
    } else {
      if (!mediaPermission.granted) {
        let res = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (res.granted === "none") {
          this.props.setHidden();
          return;
        }
      }
      res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: true,
      });
    }
    if (!res.cancelled) {
      this.props.setImage(res.uri, res.base64);
      this.props.setHidden();
    }
  };
  render() {
    return (
      <ImagePickerModal
        setSelected={this.setSelected.bind(this)}
        setHidden={this.props.setHidden}
      />
    );
  }
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, { showMessage })(ImagePickerCustom);
