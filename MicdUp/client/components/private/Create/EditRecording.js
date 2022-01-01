import React, { Component } from "react";
import { connect } from "react-redux";
import { View } from "react-native";
//icons
import { AntDesign } from "@expo/vector-icons";
export class EditRecording extends Component {
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
    return (
      <View>
        <AntDesign
          style={styles.topLeftIcon}
          name="leftcircle"
          size={24}
          color="white"
          onPress={() => {
            this.props.hideEditRecording();
          }}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, {})(EditRecording);
