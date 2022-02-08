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
        { height: screenHeight },
        { marginTop: 0 },
        { marginLeft: 0 },
      ],
      count: 1,
      adjustment: 0,
      index: 0,
      endIndex: 0,
      intervalId: "",
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
    let startIndex = index + 1;
    let endIndex = index + 1;
    if (
      !post.speechToText ||
      post.speechToText.length === 0 ||
      !post.speechToText[startIndex]
    )
      return;
    let arr = [post.speechToText[startIndex]];
    let string = arr.map((p, i) => p.word + " " + p.time + " ").join();
    let measurement = this.getTextWidth(string);
    while (measurement < screenWidth && post.speechToText[endIndex + 1]) {
      endIndex = endIndex + 1;
      arr.push(post.speechToText[endIndex]);
      string = arr.map((p, i) => p.word + " " + p.time + " ").join();
      measurement = this.getTextWidth(string);
    }
    this.mounted && this.setState({ endIndex });
    return arr;
  };

  getNextLineOfText = async () => {
    const { fontSpecs, index, count, endIndex } = this.state;
    const { post } = this.props;
    let screenWidth = Dimensions.get("window").width;
    let startIndex = index + 1;
    if (
      !post.speechToText ||
      post.speechToText.length === 0 ||
      !post.speechToText[startIndex]
    )
      return;
    let arr = [post.speechToText[startIndex]];
    let string = arr.map((p, i) => p.word + " " + p.time + " ").join();
    let measurement = await rnTextSize.measure({
      text: string, // text to measure, can include symbols
      ...fontSpecs, // RN font specification
    });
    while (measurement.width < screenWidth && post.speechToText[endIndex + 1]) {
      endIndex = endIndex + 1;
      arr.push(post.speechToText[endIndex]);
      string = arr.map((p, i) => p.word + " " + p.time + " ").join();
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
    const intervalId = setInterval(async () => {
      await this.SlidePane();
    }, 1000);
    this.mounted && this.setState({ intervalId });
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
          text: post.speechToText[index + 1].word, // text to measure, can include symbols
          ...fontSpecs, // RN font specification
        });
        size = size.width;
      } else
        size = this.getTextWidth(
          post.speechToText[index + 1].word +
            " " +
            post.speechToText[index + 1].time +
            " "
        );
      Animated.timing(this.animatedLeftMargin, {
        toValue: -1 * (adjustment + size),
        duration: 900,
        useNativeDriver: Platform.OS !== "web" ? true : false,
      }).start(async () => {
        const { adjustment, endIndex, words } = this.state;
        if (!post.speechToText[endIndex + 1] || !words || !words.length) return;
        let newWords = [...words, post.speechToText[endIndex + 1]];
        // number of words in string
        // this scrolls to next word using state
        if (count < 50) {
          this.mounted &&
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

  render() {
    const { index, words } = this.state;
    const { fontSize } = this.props;
    try {
      return (
        <Animated.View
          style={[
            this.state.MainPosition,
            { transform: [{ translateX: this.animatedLeftMargin }] },
            { flexDirection: "row" },
            { position: "absolute" },
            { left: 20 },
            { top: 40 },
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
                return p.word + " " + p.time + " ";
              })}
            </Text>
          ) : (
            words &&
            words.length &&
            words.map((p, i) => (
              <Text
                style={
                  index === 0
                    ? { color: "#6FF6fff", fontSize: fontSize }
                    : { fontSize }
                }
                key={i}
              >
                {p.word} {p.time}
              </Text>
            ))
          )}
        </Animated.View>
      );
    } catch (err) {
      console.log(err);
      return (
        <View>
          <Text>Err</Text>
        </View>
      );
    }
  }
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, {})(SpeechToText);
