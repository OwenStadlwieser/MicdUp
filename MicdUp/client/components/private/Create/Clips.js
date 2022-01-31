import React, { Component } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { connect } from "react-redux";
// helpers
import { playSound } from "../../../reuseableFunctions/helpers";
// components
import { DragSortableView } from "react-native-drag-sort";
// icons
import { Feather } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
// redux
import { updateClips } from "../../../redux/actions/recording";

const { width } = Dimensions.get("window");

const parentWidth = width < 1000 ? width * 0.95 : width * 0.8;
const childrenWidth = width < 1000 ? width * 0.95 : width * 0.8;
const childrenHeight = 48;

export class Clips extends Component {
  constructor(props) {
    super();

    this.state = {
      scrollEnabled: true,
      playingIndex: -1,
      playbackObject: null,
    };
    this.mounted = true;
  }

  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = () => {};
  render() {
    const dataProp = this.props.clips;
    const { itemClicked } = this.props;
    console.log(itemClicked)
    return (
      <SafeAreaView style={{ backgroundColor: "#fff", flex: 1 }}>
        <ScrollView
          ref={(scrollView) => (this.scrollView = scrollView)}
          scrollEnabled={this.state.scrollEnabled}
          style={styles.container}
        >
          <DragSortableView
            dataSource={dataProp}
            parentWidth={parentWidth}
            childrenWidth={childrenWidth}
            childrenHeight={childrenHeight}
            scaleStatus={"scaleY"}
            onDragStart={(startIndex, endIndex) => {
              this.setState({
                scrollEnabled: false,
              });
            }}
            onDragEnd={(startIndex) => {
              this.setState({
                scrollEnabled: true,
              });
            }}
            onDataChange={(data) => {
              if (data.length != dataProp.length) {
                this.props.updateClips(data);
              }
            }}
            keyExtractor={(item, index) => item.finalDuration}
            onClickItem={(data, item, index) => {
              itemClicked && itemClicked(index)
            }}
            renderItem={(item, index) => {
              return this.renderItem(item, index);
            }}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  stopCurrentSound = async () => {
    const { playbackObject } = this.state;
    if (!playbackObject) return;
    await playbackObject.stopAsync();
    this.mounted && this.setState({ playingIndex: -1 });
  };
  onPlaybackStatusUpdate(status) {
    if (status.didJustFinish)
      this.mounted && this.setState({ playingIndex: -1 });
  }
  deleteItem(index) {
    const clips = [...this.props.clips];
    clips.splice(index, 1);
    this.props.updateClips(clips);
  }
  renderItem(item, index) {
    const { playingIndex } = this.state;
    const { selectedClips } = this.props;
    return (
      <View style={styles.item}>
        <View style={selectedClips && selectedClips[index] ? styles.selectedItem : styles.item_children}>
          <Text style={styles.item_text}>Clip {index + 1}</Text>
          <Text style={styles.item_text}>
            {Math.round(item.finalDuration / 1000)} Seconds
          </Text>
          <View style={styles.iconContainerClips}>
            {playingIndex !== index ? (
              <AntDesign
                onPress={async () => {
                  await this.stopCurrentSound();
                  const playbackObject = await playSound(
                    this.props.clips[index].uri,
                    this.onPlaybackStatusUpdate.bind(this)
                  );
                  this.mounted &&
                    this.setState({ playingIndex: index, playbackObject });
                }}
                style={styles.playButton}
                name="play"
                size={24}
                color="red"
              />
            ) : (
              <AntDesign
                onPress={async () => {
                  await this.stopCurrentSound();
                }}
                style={styles.playButton}
                name="pausecircle"
                size={24}
                color="red"
              />
            )}
            <Feather
              onPress={() => this.deleteItem(index)}
              name="scissors"
              size={24}
              color="red"
            />
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A3561",
    borderColor: "white",
    borderRadius: 8,
    borderStyle: "solid",
    borderWidth: 2,
  },
  item: {
    width: childrenWidth,
    height: childrenHeight,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedItem: {
    width: childrenWidth,
    height: childrenHeight - 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    paddingHorizontal: 15,
    backgroundColor: "#06C1D7"
  },
  item_children: {
    width: childrenWidth,
    height: childrenHeight - 4,
    backgroundColor: "#1A3561",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    paddingHorizontal: 15,
  },
  iconContainerClips: {
    flexDirection: "row",
  },
  item_icon: {
    width: childrenHeight * 0.6,
    height: childrenHeight * 0.6,
    marginLeft: 15,
    resizeMode: "contain",
  },
  playButton: {
    marginRight: 15,
  },
  item_text: {
    marginRight: 15,
    color: "white",
    fontStyle: "italic",
  },
});

const mapStateToProps = (state) => ({
  clips: state.recording.clips,
});

export default connect(mapStateToProps, { updateClips })(Clips);
