import React, { Component } from "react";
import { connect } from "react-redux";
import { View } from "react-native";
//icons
import { AntDesign } from "@expo/vector-icons";
// styles
import { styles } from "../../../styles/Styles";

export class SubmitRecording extends Component {
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
    const { updateSubmitRecording } = this.props;
    return (
      <View style={styles.pane}>
        <AntDesign
          style={styles.topLeftIcon}
          name="leftcircle"
          size={24}
          color="white"
          onPress={() => {
            updateSubmitRecording(false);
          }}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, {})(SubmitRecording);
