import React, { Component } from "react";
import { connect } from "react-redux";
import {
  View,
  Text,
  Animated,
  Easing,
  Dimensions,
  Platform,
} from "react-native";
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
    };
    this.animatedLeftMargin = new Animated.Value(0);
  }

  componentWillUnmount = () => (this.mounted = false);

  getTextWidth(text, font) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    context.font = font || getComputedStyle(document.body).font;

    return context.measureText(text).width;
  }

  getNextLineOfTextWeb = async () => {
    const { fontSpecs, index, count } = this.state;
    const { post } = this.props;
    let screenWidth = Dimensions.get("window").width,
      screenHeight = Dimensions.get("window").height;
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
    let measurement = this.getTextWidth(string, "Roboto");
    while (measurement.width < screenWidth && post.speechToText[endIndex + 1]) {
      endIndex = endIndex + 1;
      arr.push(post.speechToText[endIndex]);
      string = arr.map((p, i) => p.word + " " + p.time + " ").join();
      measurement = this.getTextWidth(string, "Roboto");
    }
    this.mounted && this.setState({ endIndex });
    return arr;
  };

  getNextLineOfText = async () => {
    const { fontSpecs, index, count } = this.state;
    const { post } = this.props;
    let screenWidth = Dimensions.get("window").width,
      screenHeight = Dimensions.get("window").height;
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
    words =
      Platform.OS === "web"
        ? this.getNextLineOfTextWeb()
        : await this.getNextLineOfText();
    this.mounted && this.setState({ words });
    setInterval(async () => {
      await this.SlidePane();
    }, 1000);
  };

  SlidePane = async () => {
    let screenHeight = Dimensions.get("window").height,
      screenWidth = Dimensions.get("window").width,
      theLeftMargin;
    const { post } = this.props;
    const { fontSpecs, index, adjustment } = this.state;
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
        size = this.getTextWidth(post.speechToText[index + 1].word, "Roboto");
      Animated.timing(this.animatedLeftMargin, {
        toValue: -1 * (adjustment + size),
        duration: 500,
        useNativeDriver: Platform.OS !== "web" ? true : false,
      }).start(async () => {
        const { count, endIndex, index, adjustment, words } = this.state;
        let size;
        if (!post.speechToText[index + 1]) return;
        let newWords = [...words, post.speechToText[index + 1]];
        if (Platform.OS !== "web") {
          size = await rnTextSize.measure({
            text: post.speechToText[index + 1].word + " ", // text to measure, can include symbols
            ...fontSpecs, // RN font specification
          });
          size = size.width;
        } else {
          size = this.getTextWidth(post.speechToText[index + 1].word, "Roboto");
          size = size.width;
        }
        if (count < 100) {
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
            });
          this.text.forceUpdate();
        } else {
          let newWords =
            Platform.OS === "web"
              ? this.getNextLineOfTextWeb()
              : await this.getNextLineOfText();
          Animated.timing(this.animatedLeftMargin, {
            toValue: 0,
            duration: 0,
            useNativeDriver: Platform.OS !== "web" ? true : false,
          }).start();
          this.mounted &&
            this.setState({
              MainPosition: [
                { width: screenWidth },
                { height: screenHeight },
                { marginTop: 0 },
              ],
              adjustment: size,
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
    const { post, textStyle } = this.props;
    const { xPos, index, words } = this.state;
    try {
      return (
        <Animated.View
          style={[
            this.state.MainPosition,
            { transform: [{ translateX: this.animatedLeftMargin }] },
          ]}
        >
          <Text
            key={index}
            ref={(ref) => (this.text = ref)}
            style={{ overflow: "visible", flexWrap: "nowrap", flex: 1 }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {words &&
              words.map((p, i) => {
                return p.word ? p.word + " " + p.time + " " : "";
              })}
          </Text>
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
