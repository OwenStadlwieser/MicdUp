import React, { Component } from "react";
import { connect } from "react-redux";
import { View, Text, Animated, Dimensions, Platform } from "react-native";
import rnTextSize, { TSFontSpecs } from "react-native-text-size";
import { styles } from "../../styles/Styles";
export class SpeechToText extends Component {
  constructor() {
    super();
    this.mounted = true;
    let screenWidth = Dimensions.get("window").width,
      screenHeight = Dimensions.get("window").height;
    this.state = {
      MainPosition: [
        styles.main,
        { width: screenWidth },
        { marginTop: 0 },
        { marginLeft: 0 },
      ],
      count: 1,
      adjustment: 0,
      index: 0,
      endIndex: 0,
      intervalId: "",
      lastIndex: -1,
    };
    this.animatedLeftMargin = new Animated.Value(0);
  }

  componentWillUnmount = () => {
    const { intervalId } = this.props;
    clearInterval(intervalId);
    this.mounted = false;
  };

  getTextWidth(text, font) {
    const { fontSize } = this.props;
    const defaultFont = `"Times New Roman"`;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context.font = font
      ? fontSize + "px" + " " + font
      : fontSize + "px" + " " + defaultFont;
    return context.measureText(text).width;
  }

  getNextLineOfTextWeb = () => {
    const { index } = this.state;
    const { post } = this.props;
    let screenWidth = Dimensions.get("window").width;
    let startIndex = index;
    let endIndex = index;
    if (
      !post.speechToText ||
      post.speechToText.length === 0 ||
      !post.speechToText[startIndex]
    )
      return;
    let arr = [post.speechToText[startIndex]];
    let string = arr.map((p, i) => p.word + " ").join();
    let measurement = this.getTextWidth(string);
    while (measurement < screenWidth && post.speechToText[endIndex + 1]) {
      endIndex = endIndex + 1;
      arr.push(post.speechToText[endIndex]);
      string = arr.map((p, i) => p.word + " ").join();
      measurement = this.getTextWidth(string);
    }
    this.mounted && this.setState({ endIndex });
    return arr;
  };

  getNextLineOfText = async () => {
    const { fontSpecs, index, count } = this.state;
    const { post } = this.props;
    let screenWidth = Dimensions.get("window").width;
    let startIndex = index;
    let endIndex = index;
    if (
      !post.speechToText ||
      post.speechToText.length === 0 ||
      !post.speechToText[startIndex]
    )
      return;
    let arr = [post.speechToText[startIndex]];
    let string = arr.map((p, i) => p.word + " ").join();
    let measurement = await rnTextSize.measure({
      text: string, // text to measure, can include symbols
      ...fontSpecs, // RN font specification
    });
    while (measurement.width < screenWidth && post.speechToText[endIndex + 1]) {
      endIndex = endIndex + 1;
      arr.push(post.speechToText[endIndex]);
      string = arr.map((p, i) => p.word + " ").join();
      measurement = await rnTextSize.measure({
        text: string, // text to measure, can include symbols
        ...fontSpecs, // RN font specification
      });
    }
    this.mounted && this.setState({ endIndex });
    return arr;
  };

  componentDidMount = async () => {
    const { fontSize, post } = this.props;
    this.mounted &&
      this.setState({
        fontSpecs: {
          fontFamily: undefined,
          fontSize: fontSize,
          fontStyle: "italic",
          fontWeight: "bold",
        },
      });
    let words =
      Platform.OS === "web"
        ? this.getNextLineOfTextWeb()
        : await this.getNextLineOfText();
    this.mounted && this.setState({ words });
  };

  SlidePane = async () => {
    let screenHeight = Dimensions.get("window").height,
      screenWidth = Dimensions.get("window").width,
      theLeftMargin;
    const { post } = this.props;
    const { fontSpecs, index, adjustment, count } = this.state;
    let size;
    try {
      if (!post.speechToText || !post.speechToText[index + 1]) return;
      if (Platform.OS !== "web") {
        size = await rnTextSize.measure({
          text: post.speechToText[index + 1].word + " ", // text to measure, can include symbols
          ...fontSpecs, // RN font specification
        });
        size = size.width;
      } else size = this.getTextWidth(post.speechToText[index + 1].word + " ");
      Animated.timing(this.animatedLeftMargin, {
        toValue: -1 * (adjustment + size),
        duration:
          post.speechToText[index + 1].time - post.speechToText[index].time,
        useNativeDriver: Platform.OS !== "web" ? true : false,
      }).start(async () => {
        const { adjustment, endIndex, words } = this.state;
        if (!post.speechToText[endIndex + 1] || !words || !words.length) return;
        let newWords = [...words, post.speechToText[endIndex + 1]];
        // number of words in string
        // this scrolls to next word using state
        if (count < 50) {
          const { playing } = this.state;
          const { currentPlayingSound } = this.props;
          this.mounted &&
            currentPlayingSound &&
            currentPlayingSound.uri === post.signedUrl &&
            playing &&
            this.setState({
              MainPosition: [
                { width: screenWidth },
                { height: screenHeight },
                { marginTop: 0 },
              ],
              adjustment: size + adjustment,
              index: index + 1,
              words: newWords,
              count: count + 1,
              endIndex: endIndex + 1,
            });
        } else {
          // clears cached words and resets div
          Animated.timing(this.animatedLeftMargin, {
            toValue: 0,
            duration: 0,
            useNativeDriver: Platform.OS !== "web" ? true : false,
          }).start();
          let newWords =
            Platform.OS === "web"
              ? this.getNextLineOfTextWeb()
              : await this.getNextLineOfText();
          this.mounted &&
            this.state.playing &&
            this.setState({
              MainPosition: [
                { width: screenWidth },
                { height: screenHeight },
                { marginTop: 0 },
              ],
              adjustment: 0,
              index: index + 1,
              words: newWords,
              count: 0,
            });
        }
      });
    } catch (err) {
      console.log(err);
    }
  };

  componentDidUpdate = async (prevProps) => {
    const { time, currentPlayingSound, post } = this.props;
    const { index, playing, lastIndex } = this.state;
    if (
      currentPlayingSound &&
      post &&
      currentPlayingSound.uri === post.signedUrl &&
      post.speechToText[index] &&
      post.speechToText[index].time < time
    ) {
      if (!playing) this.mounted && this.setState({ playing: true });
      lastIndex !== index &&
        this.SlidePane() &&
        this.mounted &&
        this.setState({ lastIndex: index });
    } else if (
      prevProps.currentPlayingSound &&
      prevProps.post &&
      prevProps.currentPlayingSound.uri === prevProps.post.signedUrl &&
      (!currentPlayingSound || !(currentPlayingSound.uri === post.signedUrl))
    ) {
      if (playing) {
        this.mounted &&
          this.setState({
            index: 0,
            endIndex: 0,
            count: 1,
            adjustment: 0,
            playing: false,
            lastIndex: -1,
          });
        let words =
          Platform.OS === "web"
            ? this.getNextLineOfTextWeb()
            : await this.getNextLineOfText();
        this.mounted && this.setState({ words });
        Animated.timing(this.animatedLeftMargin, {
          toValue: 0,
          duration: 0,
          useNativeDriver: Platform.OS !== "web" ? true : false,
        }).start();
      }
    }
  };
  render() {
    const { words } = this.state;
    const { fontSize, containerStyle } = this.props;
    try {
      return (
        <Animated.View
          style={[
            this.state.MainPosition,
            { transform: [{ translateX: this.animatedLeftMargin }] },
            ...containerStyle,
          ]}
        >
          {Platform.OS === "web" && words && words.length ? (
            <Text
              numberOfLines={1}
              style={{
                overflow: "visible",
                flexWrap: "nowrap",
                flex: 1,
                fontSize: fontSize,
              }}
            >
              {words.map((p, i) => {
                return p.word + " ";
              })}
            </Text>
          ) : (
            words &&
            words.length &&
            words.map((p, i) => (
              <Text style={{ fontSize }} key={i}>
                {p.word}{" "}
              </Text>
            ))
          )}
        </Animated.View>
      );
    } catch (err) {
      return (
        <View>
          <Text>Err</Text>
        </View>
      );
    }
  }
}

const mapStateToProps = (state) => ({
  recording: state.sound.currentPlaybackObject,
  currentPlayingSound: state.sound.currentPlayingSound,
  time: state.sound.time,
});

export default connect(mapStateToProps, {})(SpeechToText);
