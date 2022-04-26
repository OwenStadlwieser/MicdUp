import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { AntDesign } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
// redux
import { showSoundModal } from "../../redux/actions/display";

export class SoundPlayer extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      showing: false,
    };

    this.mounted = true;
  }

  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = () => {};

  render() {
    return (
      <TouchableOpacity style={{ paddingRight: 10 }}>
        <AntDesign
          onPress={() => {
            this.props.showSoundModal(true);
          }}
          name="sound"
          size={24}
          color="white"
        />
      </TouchableOpacity>
    );
  }
}

export default connect(null, { showSoundModal })(SoundPlayer);
