import React, { Component } from "react";
import { connect } from "react-redux";
import { View, Dimensions } from "react-native";
import Svg, { Rect } from "react-native-svg";
const offset = width / 2;
const { width, height } = Dimensions.get("window");
import RNSoundLevel from "react-native-sound-level";
export class AudioRecordingVisualization extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      soundLevels: [],
    };

    this.mounted = true;
  }

  onNewFrame = (data) => {
    console.log(data);
    let { soundLevels } = this.state;
    const { barWidth } = this.props;
    soundLevels.unshift(data);
    if (soundLevels.length > Math.floor(width / barWidth)) {
      soundLevels.pop();
    }
    this.mounted && this.setState({ soundLevels });
  };

  componentWillUnmount = () => {
    RNSoundLevel.stop();
    this.mounted = false;
  };

  componentDidMount = () => {
    RNSoundLevel.start(75);
    RNSoundLevel.onNewFrame = (data) => {
      this.onNewFrame(data);
    };
  };

  render() {
    const { recording, barWidth, barMargin } = this.props;
    const { soundLevels } = this.state;
    const svgHeight = height * 0.3;
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
            {soundLevels.map((decibel, index) => (
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
          {soundLevels.map((decibel, index) => (
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
