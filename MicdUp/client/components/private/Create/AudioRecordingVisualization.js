import React, { Component } from "react";
import { connect } from "react-redux";
import { View, Dimensions } from "react-native";
import Svg, { Rect } from "react-native-svg";
const barWidth = 5;
const barMargin = 1;
const offset = width / 2;
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
    const { arrayOfDecibels, recording } = this.props;
    const svgHeight = height * 0.15;
    const slice = arrayOfDecibels.slice(0, Math.floor(width / barWidth));
    const app = recording ? (
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
            height: svgHeight,
            width,
            bottom: 0,
            left: 0,
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
                y={(svgHeight - (decibel.value + 80) * 2) / 2}
                x={index * (barWidth + barMargin)}
                fill={"#6DB5C4"}
                height={decibel.value + 80 > 0 ? (decibel.value + 80) * 2 : 0}
                width={barWidth}
              ></Rect>
            ))}
          </Svg>
        </View>
      </View>
    ) : (
      <View
        style={{
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
              y={(svgHeight - (decibel.value + 80) * 2) / 2}
              x={index * (barWidth + barMargin)}
              fill={"#6DB5C4"}
              height={decibel.value + 80 > 0 ? (decibel.value + 80) * 2 : 0}
              width={barWidth}
            ></Rect>
          ))}
        </Svg>
      </View>
    );
    return app;
  }
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, {})(AudioRecordingVisualization);
