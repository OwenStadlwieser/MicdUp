import React, { Component } from "react";
import { connect } from "react-redux";
import { View, Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");
export class AudioRecordingVisualization extends Component {
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
      <View
        style={{
          width,
          height,
          backgroundColor: "black",
          opacity: 0.8,
          position: "absolute",
          bottom: 0,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          zIndex: 5,
        }}
      >
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            height: 50,
            width,
            bottom: 0,
            left: 0,
          }}
        ></View>
      </View>
    );
  }
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, {})(AudioRecordingVisualization);
