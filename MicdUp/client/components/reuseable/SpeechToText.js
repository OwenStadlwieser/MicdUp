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
  startAnimation = () => {
    Animated.timing(this.animatedValue, {
      toValue: 1,
      duration: 1000,
      delay: 1000,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  };

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
      adjustment: 0,
      index: 0,
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

  componentDidMount = async () => {
    const { fontSize } = this.props;
    this.mounted &&
      this.setState({
        fontSpecs: {
          fontFamily: undefined,
          fontSize: fontSize,
          fontStyle: "italic",
          fontWeight: "bold",
        },
      });
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
      if (Platform.OS !== "web")
        size = await rnTextSize.measure({
          text: post.speechToText[index + 1].word, // text to measure, can include symbols
          ...fontSpecs, // RN font specification
        });
      else
        size = this.getTextWidth(post.speechToText[index + 1].word, "Roboto");
      Animated.timing(this.animatedLeftMargin, {
        toValue: adjustment + size,
        duration: 1000,
        easing: Easing.linear,
      }).start(() => {
        this.mounted &&
          this.setState({
            MainPosition: [
              { width: screenWidth },
              { height: screenHeight },
              { marginTop: 0 },
            ],
            adjustment: adjustment + size,
            index: index + 1,
          });
      });
    } catch (err) {
      console.log(err);
    }
  };

  render() {
    const { post, textStyle } = this.props;
    const { xPos, index } = this.state;
    if (post.speechToText[0]) {
      console.log(this.animatedLeftMargin);
    }
    return (
      <Animated.View
        style={[
          this.state.MainPosition,
          { marginRight: this.animatedLeftMargin },
        ]}
      >
        <Text key={index} numberOfLines={1} style={{ overflow: "visible" }}>
          {post.speechToText &&
            post.speechToText.map((p, i) => {
              return p.word && i >= index ? p.word + " " : "";
            })}
        </Text>
      </Animated.View>
    );
  }
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, {})(SpeechToText);
