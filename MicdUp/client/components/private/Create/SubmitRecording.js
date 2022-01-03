import React, { Component } from "react";
import { connect } from "react-redux";
// components
import { RadioButton } from "react-native-paper";
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Text,
} from "react-native";
import SearchComponent from "../../reuseable/SearchComponent";
//icons
import { AntDesign } from "@expo/vector-icons";
// styles
import { styles } from "../../../styles/Styles";
// redux
import { updateTags, uploadRecording } from "../../../redux/actions/recording";
import { searchTags } from "../../../redux/actions/tag";
// helpers
import { soundBlobToBase64 } from "../../../reuseableFunctions/helpers";

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
    const { updateSubmitRecording, clips, tags } = this.props;
    const { nsfw, allowRebuttal, allowStitch, privatePost } = this.state;
    return (
      <View style={styles.pane}>
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
            placeholder={"Tags"}
            setStateOnChange={true}
            setStateOnChangeFunc={this.setTagsState.bind(this)}
            searchFunction={this.props.searchTags}
            splitSearchTerm={true}
            inputStyle={styles.textInputRecEdit}
            placeHolderColor={"white"}
            initValue={tags}
          />
        </View>
        <ScrollView
          scrollEnabled={true}
          style={styles.recordingSettings}
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
        <View style={styles.playButtonContainer}>
          <AntDesign
            style={styles.playButton}
            name="play"
            size={48}
            color="white"
          />
        </View>
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
                  console.log("erroor with blob");
                }
              }
              await this.props.uploadRecording(
                files,
                fileTypes,
                tags.split(/[\s,]+/),
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
  clips: state.recording.clips,
});

export default connect(mapStateToProps, {
  updateTags,
  uploadRecording,
  searchTags,
})(SubmitRecording);
