import React, { Component } from "react";
import { connect } from "react-redux";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
  Dimensions,
  View,
} from "react-native";
import { styles } from "../../styles/Styles";
export class DropDown extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
    };

    this.mounted = true;
  }

  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = () => {};

  handleClickOutside = () => {
    this.props.onBlur();
  };
  render() {
    const { results, title, containerStyle, parentStyle, image } = this.props;
    const { width, height } = Dimensions.get("window");
    return (
      <TouchableWithoutFeedback onPress={this.handleClickOutside}>
        <View style={parentStyle}>
          <ScrollView style={containerStyle}>
            {results &&
              results.map((res, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    this.props.onPressFunc(res);
                  }}
                  style={styles.listItemContainer}
                >
                  {image && (
                    <Image
                      source={
                        res.image
                          ? {
                              uri: res.image,
                            }
                          : require("../../assets/no-profile-pic-icon-27.jpg")
                      }
                      style={styles.listItemProfileImg}
                    />
                  )}
                  <Text style={styles.listItemText}>{res[title]}</Text>
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, {})(DropDown);
