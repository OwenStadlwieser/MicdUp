import React, { Component } from "react";
import { connect } from "react-redux";
import { View, Dimensions, TouchableOpacity } from "react-native";
import Svg, { Rect } from "react-native-svg";
import { styles } from "../../../styles/Styles";
import { FontAwesome5 } from "@expo/vector-icons";
const barWidth = 5;
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
    const { arrayOfDecibels, recording, buttonColor, stopRecording } =
      this.props;
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
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            fontSize: 50,
            position: "absolute",
            bottom: height * 0.08,
            width,
            left: 0,
            opacity: 1.0,
            zIndex: 6,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              console.log("stopping2");
              stopRecording();
            }}
            style={{ height: 50, width: 50, backgroundColor: "orange" }}
          >
            <FontAwesome5
              onPress={() => {
                console.log("stopping");
                stopRecording();
              }}
              style={{
                fontSize: 60,
                opacity: 1.0,
              }}
              name="record-vinyl"
              size={60}
              color={buttonColor}
            />
          </TouchableOpacity>
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
