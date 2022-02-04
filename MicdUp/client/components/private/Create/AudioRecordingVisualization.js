import React, { Component } from "react";
import { connect } from "react-redux";
import { View, Dimensions } from "react-native";
import Svg, { Rect } from "react-native-svg";
const barWidth = 6;
const barMargin = 1;
const { width, height } = Dimensions.get("window");
const offset = width / 2;
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
    const { arrayOfDecibels } = this.props;
    const svgHeight = height * 0.3;
    const slice = arrayOfDecibels.slice(0, Math.floor(width / barWidth));
    return (
      <View
        style={{
          width,
          alignItems: "center",
          justifyContent: "center",
          height: svgHeight,
        }}
      >
        <Svg
          style={{
            color: "white",
          }}
        >
          {slice.map((decibel, index) => (
            <Rect
              key={index}
              y={(svgHeight - (decibel.value + 100)) / 2}
              x={index * (barWidth + barMargin)}
              fill={"red"}
              height={decibel.value + 100}
              width={barWidth}
            ></Rect>
          ))}
        </Svg>
      </View>
    );
  }
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, {})(AudioRecordingVisualization);
