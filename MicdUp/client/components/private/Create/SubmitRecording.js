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
import { soundBlobToBase64 } from "../../../reuseableFunctions/helpers";
const { height, width } = Dimensions.get("window");
export class SubmitRecording extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      nsfw: false,
      allowStitch: true,
      allowRebuttal: true,
      privatePost: false,
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

  render() {
    const { updateSubmitRecording, clips, tags, title, playingId } = this.props;
    const { nsfw, allowRebuttal, allowStitch, privatePost } = this.state;
    const newClips = clips.map((clip) => {
      clip.signedUrl = clip.uri;
      return clip;
    });
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
            initValue={tags ? tags.toString() : ""}
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
          size={72}
          post={{
            id: !this.mounted
              ? ""
              : playingId === null
              ? clips[0] && clips[0].id
              : clips.findIndex((item) => item && item.id === playingId) > -1
              ? clips[clips.findIndex((item) => item && item.id === playingId)]
                  .id
              : 123,
            signedUrl: clips[0] && clips[0].uri,
          }}
          queue={newClips.length > 1 && [...newClips.slice(1, newClips.length)]}
          playButtonSty={{ fontSize: 72 }}
        />
        <View style={styles.continueButtonContainer}>
          <TouchableOpacity style={styles.nextButton}>
            <Text style={styles.nextButtonText}>Discard</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              let files = [];
              let fileTypes = [];
              let clipResults = [];
              for (let i = 0; i < clips.length; i++) {
                const base64Url = await soundBlobToBase64(clips[i].uri);
                if (base64Url != null) {
                  const fileType = clips[i].type;
                  files.push(base64Url);
                  fileTypes.push(fileType);
                  clipResults.push(JSON.stringify(clips[i].results));
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
                privatePost,
                clipResults
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
  playingId:
    state.sound.currentPlayingSound && state.sound.currentPlayingSound.id,
});

export default connect(mapStateToProps, {
  updateTags,
  uploadRecording,
  searchTags,
})(SubmitRecording);
