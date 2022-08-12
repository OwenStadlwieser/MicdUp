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
  TouchableWithoutFeedback,
} from "react-native";
import SearchComponent from "../../reuseable/SearchComponent";
import PlayButton from "../../reuseable/PlayButton";
//icons
import { AntDesign } from "@expo/vector-icons";
// styles
import { styles } from "../../../styles/Styles";
// redux
import {
  updateTags,
  uploadRecording,
  deleteTag,
} from "../../../redux/actions/recording";
import { addLoading, removeLoading } from "../../../redux/actions/display";
import { searchTags, randomTag } from "../../../redux/actions/tag";
// helpers
import { soundBlobToBase64 } from "../../../reuseableFunctions/helpers";
import DeleteableItem from "../../reuseable/DeleteableItem";

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
      tagsArray: [],
      showResults: false,
      inputTerm: "",
    };

    this.mounted = true;
  }

  componentWillUnmount = () => {
    this.props.removeLoading("SUBMITRECORDING");
    this.mounted = false;
  };

  componentDidMount = () => {
    const { tags } = this.props;
    this.mounted && this.setState({ tags });
  };

  setTagsState = (tags) => {
    this.mounted && this.setState({ inputTerm: tags });
  };

  setTagsArrayState = (tags) => {
    this.mounted && this.setState({ tagsArray: tags });
  };

  handleClickOutside = () => {
    this.mounted && this.setState({ showResults: false });
  };
  render() {
    const { updateSubmitRecording, clips, tags, title, playingId } = this.props;
    const {
      nsfw,
      allowRebuttal,
      allowStitch,
      privatePost,
      tagsArray,
      showResults,
      inputTerm,
    } = this.state;
    const newClips = clips.map((clip) => {
      clip.signedUrl = clip.uri;
      return clip;
    });
    return (
      <TouchableWithoutFeedback onPress={this.handleClickOutside}>
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
          <View style={{ zIndex: 2 }}>
            <SearchComponent
              parentViewStyle={{ zIndex: 2 }}
              searchInputContainerStyle={styles.searchInputContainerStyleUsers}
              placeholder={"Tags"}
              setStateOnChange={true}
              setStateOnChangeFunc={this.setTagsState.bind(this)}
              confirmOnSubmit={true}
              confirmOnSubmitFunc={(tag) => {
                this.props.updateTags(tag);
              }}
              inputTerm={inputTerm}
              searchFunction={this.props.searchTags}
              splitSearchTerm={true}
              setResOnChange={true}
              setResOnChangeFunc={this.setTagsArrayState.bind(this)}
              inputStyle={styles.textInputRecEdit}
              placeHolderColor={"white"}
              initValue={tags ? tags.toString() : ""}
              displayResults={false}
              onFocus={() =>
                this.mounted && this.setState({ showResults: true })
              }
            />
            <View
              style={{
                position: "absolute",
                zIndex: 2,
                top: height * 0.1 + 10,
              }}
            >
              <ScrollView
                style={{
                  flex: 1,
                  marginBottom: 20,
                  maxHeight: height * 0.35,
                }}
              >
                {tagsArray &&
                  tagsArray.length > 0 &&
                  showResults &&
                  tagsArray.map((res, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={async () => {
                        this.props.updateTags(res.title);
                        this.mounted &&
                          this.setState({
                            inputTerm: "",
                          });
                      }}
                      style={[
                        styles.listItemContainerUser,
                        { width: width * 0.6 },
                      ]}
                    >
                      <Text style={styles.listItemTextUser}>{res.title}</Text>
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            </View>
          </View>
          <View style={[styles.deleteItemContainer]}>
            {tags.map((res, index) => (
              <DeleteableItem
                item={{ title: res }}
                style={{ margin: 3 }}
                color={"white"}
                title={"title"}
                key={index}
                onDelete={() => {
                  this.props.deleteTag(index);
                }}
              />
            ))}
          </View>
          <ScrollView
            style={styles.recordingSettings}
            scrollEnabled={true}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.recordingSettingsOption}>
              <Text style={styles.recordingSettingsText}>Private Post</Text>
              <RadioButton
                style={{ color: "black" }}
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
                ? clips[
                    clips.findIndex((item) => item && item.id === playingId)
                  ].id
                : 123,
              signedUrl: clips[0] && clips[0].uri,
            }}
            queue={
              newClips.length > 1 && [...newClips.slice(1, newClips.length)]
            }
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
                this.props.addLoading("SUBMITRECORDING");
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

                await this.props.uploadRecording(
                  files,
                  fileTypes,
                  title,
                  tags,
                  nsfw,
                  allowRebuttal,
                  allowStitch,
                  privatePost,
                  clipResults
                );
                this.props.removeLoading("SUBMITRECORDING");
              }}
              style={styles.nextButton}
            >
              <Text style={styles.nextButtonText}>Post</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
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
  deleteTag,
  addLoading,
  removeLoading,
})(SubmitRecording);
