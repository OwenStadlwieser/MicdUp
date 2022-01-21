import React, { Component } from "react";
import { connect } from "react-redux";
// components
import Clips from "./Clips";
import Filters from "./Filters";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Platform,
} from "react-native";
//icons
import { AntDesign } from "@expo/vector-icons";
// styles
import { styles } from "../../../styles/Styles";
// redux
import { updateTitle } from "../../../redux/actions/recording";
import { showMessage } from "../../../redux/actions/display";

export class EditRecording extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      title: "",
    };

    this.mounted = true;
  }

  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = () => {
    const { reduxTitle } = this.props;
    this.mounted && this.setState({ title: reduxTitle });
  };

  render() {
    const { hideEditRecording, updateSubmitRecording } = this.props;
    const { title } = this.state;
    return (
      <View style={styles.pane}>
        <AntDesign
          style={styles.topLeftIcon}
          name="leftcircle"
          size={24}
          color="white"
          onPress={hideEditRecording}
        />
        <View style={styles.upperEditDiv}>
          <TextInput
            style={styles.textInputRecEdit}
            placeholderTextColor={"white"}
            value={title}
            placeholder="Recording Title"
            onChangeText={(text) => {
              this.props.updateTitle(text);
              this.mounted && this.setState({ title: text });
            }}
          />
        </View>
        <View style={styles.clipsEditDiv}>
          <Clips />
        </View>
        <View style={styles.filterEditDiv}>
          {Platform.OS === "ios" && <Filters />}
        </View>
        <View style={styles.continueEditDiv}>
          <TouchableOpacity
            onPress={() => {
              if (!title) {
                this.props.showMessage({
                  success: false,
                  message: "Please enter a title",
                });
                return;
              }
              this.props.updateTitle(title);
              updateSubmitRecording(true);
            }}
            style={styles.nextButton}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  reduxTitle: state.recording.title,
});

export default connect(mapStateToProps, { updateTitle, showMessage })(
  EditRecording
);
