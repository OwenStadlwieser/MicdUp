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
//icons
import { AntDesign } from "@expo/vector-icons";
// styles
import { styles } from "../../../styles/Styles";
// redux
import { updateTags } from "../../../redux/actions/recording";

export class SubmitRecording extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      NSFW: false,
      allowStitch: false,
      allowRebuttal: false,
      privatePost: false,
    };

    this.mounted = true;
  }

  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = () => {};

  render() {
    const { updateSubmitRecording, tags } = this.props;
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
        <View style={styles.upperEditDiv}>
          <TextInput
            style={styles.textInputRecEdit}
            placeholderTextColor={"white"}
            value={tags}
            placeholder="Recording Tags"
            onChangeText={(text) => {
              this.props.updateTags(text);
              this.mounted && this.setState({ tags: text });
            }}
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
          <TouchableOpacity style={styles.nextButton}>
            <Text style={styles.nextButtonText}>Post</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  tags: state.recording.tags,
});

export default connect(mapStateToProps, { updateTags })(SubmitRecording);
