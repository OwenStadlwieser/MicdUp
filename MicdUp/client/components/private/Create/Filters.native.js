import React, { Component } from "react";
import { connect } from "react-redux";
import { View, Dimensions, TouchableOpacity, Platform } from "react-native";
import { styles } from "../../../styles/Styles";
import Carousel from "react-native-snap-carousel";
// import { AudioEngine } from "react-native-audio-engine";
//(applyFilter: (NSString *)filePath numberParameter:(nonnull NSNumber *)
//reverbSetting numberParameter:(nonnull NSNumber *)pitchChange
//numberParameter:(nonnull NSNumber *)speedChange callback:(RCTResponseSenderBlock)successCallback callback:(RCTResponseSenderBlock)callback)
//callback:(RCTResponseSenderBlock)errCallback)
export class Filters extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      entries: {
        title: "Chipmunk",
        pitch: 50,
        reverb: 0,
        speed: 0,
      },
    };
    this._carousel = {};
    this.mounted = true;
  }

  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = () => {};

  _renderItem = ({ item, index }) => {
    const { clips } = this.props;
    return (
      <TouchableOpacity
        style={{
          backgroundColor: "floralwhite",
          borderRadius: 5,
          height: 250,
          padding: 50,
          marginLeft: 25,
          marginRight: 25,
        }}
        key={index}
        onPress={() => {
          console.log("Calling native function");
          // AudioEngine.applyFilter(
          //   clips[0].uri,
          //   item.reverb,
          //   item.pitch,
          //   item.speed,
          //   (path) => {
          //     console.log(path, "success");
          //   },
          //   (info) => {
          //     console.log(info, "info");
          //   },
          //   (err) => console.log(err)
          // );
        }}
      >
        <Text>{item.title}</Text>
      </TouchableOpacity>
    );
  };

  render() {
    const { width } = Dimensions;
    return (
      <Carousel
        ref={(c) => {
          this._carousel = c;
        }}
        data={this.state.entries}
        renderItem={this._renderItem}
        sliderWidth={width - 40}
        itemWidth={width / 2}
        style={{}}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  clips: state.recording.clips,
});

export default connect(mapStateToProps, {})(Filters);
