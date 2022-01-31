import React, { Component } from "react";
import { connect } from "react-redux";
import {
  View,
  Dimensions,
  TouchableOpacity,
  Text,
  NativeModules,
} from "react-native";
import { filterHeight } from "../../../styles/Styles";
import Carousel from "react-native-snap-carousel";
import { showMessage } from "../../../redux/actions/display";
import { updateClips } from "../../../redux/actions/recording";
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
      entries: [
        {
          title: "Chipmunk",
          pitch: 50,
          reverb: 0,
          speed: 0,
        },
        {
          title: "Scary",
          pitch: 50,
          reverb: 0,
          speed: 0,
        },
      ],
    };
    this._carousel = {};
    this.mounted = true;
  }

  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = () => {};

  _renderItem = ({ item, index }) => {
    const { selectedClips, clips } = this.props;
    return (
      <TouchableOpacity
        style={{
          backgroundColor: "black",
          borderRadius: 5,
          marginHorizontal: 25,
          height: filterHeight,
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "center",
        }}
        key={index}
        onPress={() => {
          console.log("here");
          try {
            const keys = Object.keys(selectedClips);
            if (!keys || keys.length === 0) {
              this.props.showMessage({
                message: "Select a Klip before applying filter",
                success: false,
              });
              return;
            }
            for (let i = 0; i < keys.length; i++) {
              let x = String(clips[i].uri);
              console.log(x);
              try {
                NativeModules.AudioEngineOBJC.applyFilter(
                  x,
                  0,
                  100,
                  100,
                  0,
                  100,
                  0,
                  0,
                  (filePath) => {
                    clips[i].originalUri = clips[i].uri;
                    clips[i].uri = filePath;
                    clips[i].filter = true;
                    this.props.updateClips(clips);
                  }
                );
              } catch (err) {
                console.log(2);
                console.log(err);
              }
              console.log(clips[i]);
            }
          } catch (err) {
            console.log(err);
            this.props.showMessage({
              message: "Something went wrong",
              success: false,
            });
            return;
          }
        }}
      >
        <Text style={{ color: "white" }}>{item.title}</Text>
      </TouchableOpacity>
    );
  };

  render() {
    const { width } = Dimensions.get("window");
    return (
      <Carousel
        ref={(c) => {
          this._carousel = c;
        }}
        data={this.state.entries}
        renderItem={this._renderItem}
        sliderWidth={width - 40}
        itemWidth={width / 2}
        style={{ alignItems: "center", justifyContent: "space-evenly" }}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  clips: state.recording.clips,
});

export default connect(mapStateToProps, { showMessage, updateClips })(Filters);
