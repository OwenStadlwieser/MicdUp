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
import { getFilters } from "../../../redux/actions/filter";
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
      size: 30,
      entries: [],
    };
    this._carousel = {};
    this.mounted = true;
  }

  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = async () => {
    this.mounted && this.setState({ loading: true });
    const res = await this.props.getFilters(0);
    console.log(res);
    this.mounted && this.setState({ entries: res, loading: false });
  };

  selectFilter(item) {
    const { selectedClips, clips } = this.props;
    try {
      const keys = Object.keys(selectedClips);
      if (!keys || keys.length === 0) {
        this.props.showMessage({
          message: "Select a Klip before applying filter",
          success: false,
        });
        return;
      }
      const assignPath = (filePath, i) => {
        clips[i].originalUri = clips[i].uri;
        clips[i].uri = filePath;
        clips[i].filter = true;
        this.props.updateClips(clips);
      };
      const handleError = (e) => {
        console.log(e);
      };
      for (let i = 0; i < keys.length; i++) {
        let x = String(clips[i].uri);
        switch (item.type) {
          case "EQUALIZER":
            NativeModules.AudioEngineOBJC.applyEqualizerFilter(
              x,
              item.equalizerPreset,
              (path) => assignPath(path, i),
              (e) => handleError(e)
            );
            break;
          case "REVERB":
            NativeModules.AudioEngineOBJC.applyReverbFilter(
              x,
              item.reverbPreset,
              item.reverb,
              (path) => assignPath(path, i),
              (e) => handleError(e)
            );
            break;
          case "PITCH":
            NativeModules.AudioEngineOBJC.applyPitchFilter(
              x,
              item.pitchNum,
              (path) => assignPath(path, i),
              (e) => handleError(e)
            );
            break;
          case "DISTORTION":
            NativeModules.AudioEngineOBJC.applyDistortionFilter(
              x,
              item.distortionPreset,
              item.distortion,
              (path) => assignPath(path, i),
              (e) => handleError(e)
            );
            break;
          case "ALL":
            NativeModules.AudioEngineOBJC.applyFilter(
              x,
              item.reverbPreset,
              item.reverb,
              item.distortionPreset,
              item.pitchNum,
              item.distortion,
              item.equalizerPreset,
              (path) => assignPath(path, i),
              (e) => handleError(e)
            );
            break;
          default:
            break;
        }
      }
    } catch (err) {
      console.log(err);
      this.props.showMessage({
        message: "Something went wrong",
        success: false,
      });
      return;
    }
  }
  _renderItem = ({ item, index }) => {
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
        onPress={() => this.selectFilter(item)}
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
        onSnapToItem={async (index) => {
          if ((index + 1) % 30 === 0 && index > 0) {
            this.mounted && this.setState({ loading: true });
            const res = await this.props.getFilters((index + 1) / 30);
            this.mounted &&
              this.setState({
                filters: [...this.state.filters, ...res],
                loading: false,
              });
          }
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

export default connect(mapStateToProps, {
  showMessage,
  updateClips,
  getFilters,
})(Filters);
