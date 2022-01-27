import React, { Component } from "react";
import { connect } from "react-redux";
// components
import { RadioButton } from "react-native-paper";
import {
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Text,
} from "react-native";
import SearchComponent from "../../reuseable/SearchComponent";
import PlayButton from "../../reuseable/PlayButton";
//icons
import { AntDesign } from "@expo/vector-icons";
// styles
import { styles } from "../../../styles/Styles";
// redux
import { updateTags, uploadRecording } from "../../../redux/actions/recording";
import { searchTags, randomTag } from "../../../redux/actions/tag";
// helpers
import { playSound } from "../../../reuseableFunctions/helpers";
import { soundBlobToBase64 } from "../../../reuseableFunctions/helpers";
const { height, width } = Dimensions.get("window")
export class SubmitRecording extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      nsfw: false,
      allowStitch: true,
      allowRebuttal: true,
      privatePost: false,
      activeClip: 0,
      playingId: '',
      clipId: "CLIP"
    };

    this.mounted = true;
  }

  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = () => {
    const { tags } = this.props;
    this.mounted && this.setState({ tags });
  };

  setTagsState = (tags) => {
    this.props.updateTags(tags);
    this.mounted && this.setState({ tags });
  };

  setPlaying(id) {
    this.mounted && this.setState({ playingId: id });
  }

  async onPlaybackStatusUpdate(status) {
    const { clips } = this.props
    const { activeClip } =this.state
    if (status.didJustFinish) {
      this.mounted && this.setState({ activeClip: activeClip < (clips.length - 1) ? activeClip + 1 : 0 });
      if (activeClip < clips.length - 1){
        this.mounted && this.setState({ playingId: "CLIP"})
        await playSound(
          clips[this.state.activeClip].uri,
          this.onPlaybackStatusUpdate.bind(this)
        );
      } else {
        this.mounted && this.setState({ playingId: ""})
      }
    }
  }

  render() {
    const { updateSubmitRecording, clips, tags, title } = this.props;
    const { nsfw, allowRebuttal, allowStitch, privatePost, activeClip, playingId, clipId } = this.state;
    console.log(activeClip)
    return (
      <View style={styles.paneSpaceEvenly}>
        <AntDesign
          style={styles.topLeftIcon}
          name="leftcircle"
          size={24}
          color="white"
          onPress={() => {
            updateSubmitRecording(false);
          }}
        />
        <View style={styles.upperEditDivAbsolute}>
          <SearchComponent
            parentViewStyle={styles.parentViewStyle}
            searchInputContainerStyle={styles.searchInputContainer}
            inputStyle={styles.inputStyle}
            placeholder={"Tags"}
            setStateOnChange={true}
            setStateOnChangeFunc={this.setTagsState.bind(this)}
            searchFunction={this.props.searchTags}
            splitSearchTerm={true}
            inputStyle={styles.textInputRecEdit}
            placeHolderColor={"white"}
            initValue={tags}
            displayResults={true}
          />
        </View>
        <ScrollView
          style={styles.recordingSettings}
          scrollEnabled={true}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.recordingSettingsOption}>
            <Text style={styles.recordingSettingsText}>NSFW</Text>
            <RadioButton
              style={styles.recordingSettingsButton}
              status={nsfw ? "checked" : "unchecked"}
              onPress={() => this.mounted && this.setState({ nsfw: !nsfw })}
            />
          </View>
          <View style={styles.recordingSettingsOption}>
            <Text style={styles.recordingSettingsText}>Allow Stitch</Text>
            <RadioButton
              style={styles.recordingSettingsButton}
              status={allowStitch ? "checked" : "unchecked"}
              onPress={() =>
                this.mounted && this.setState({ allowStitch: !allowStitch })
              }
            />
          </View>
          <View style={styles.recordingSettingsOption}>
            <Text style={styles.recordingSettingsText}>Allow Rebuttal</Text>
            <RadioButton
              style={styles.recordingSettingsButton}
              status={allowRebuttal ? "checked" : "unchecked"}
              onPress={() =>
                this.mounted && this.setState({ allowRebuttal: !allowRebuttal })
              }
            />
          </View>
          <View style={styles.recordingSettingsOption}>
            <Text style={styles.recordingSettingsText}>Private Post</Text>
            <RadioButton
              style={styles.recordingSettingsButton}
              status={privatePost ? "checked" : "unchecked"}
              onPress={() =>
                this.mounted && this.setState({ privatePost: !privatePost })
              }
            />
          </View>
        </ScrollView>
        <PlayButton
          containerStyle={{ width: width * 0.2, height: width * 0.2 }}
          color={"white"}
          currentPlayingId={playingId}
          size={72}
          post={{
            id: clipId,
            signedUrl: clips[activeClip].uri,
          }}
          playButtonSty={{ fontSize: 72 }}
          setPlaying={this.setPlaying.bind(this)}
          onPlaybackStatusUpdate={this.onPlaybackStatusUpdate.bind(this)}
        />
        <View style={styles.continueButtonContainer}>
          <TouchableOpacity style={styles.nextButton}>
            <Text style={styles.nextButtonText}>Discard</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              let files = [];
              let fileTypes = [];
              for (let i = 0; i < clips.length; i++) {
                const base64Url = await soundBlobToBase64(clips[i].uri);
                if (base64Url != null) {
                  const fileType = clips[i].type;
                  files.push(base64Url);
                  fileTypes.push(fileType);
                } else {
                  console.log("error with blob");
                }
              }
              let tagsArray = [""];
              try {
                tagsArray = tags.split("/[s,]+/");
              } catch (err) {}
              await this.props.uploadRecording(
                files,
                fileTypes,
                title,
                tagsArray,
                nsfw,
                allowRebuttal,
                allowStitch,
                privatePost
              );
            }}
            style={styles.nextButton}
          >
            <Text style={styles.nextButtonText}>Post</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  tags: state.recording.tags,
  title: state.recording.title,
  clips: state.recording.clips,
});

export default connect(mapStateToProps, {
  updateTags,
  uploadRecording,
  searchTags,
})(SubmitRecording);
