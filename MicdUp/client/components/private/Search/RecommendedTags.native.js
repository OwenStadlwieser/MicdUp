import React, { Component } from "react";
import { connect } from "react-redux";
// components
import { View, Text, Dimensions, TouchableHighlight } from "react-native";
import { SnapList, SnapItem } from "react-snaplist-carousel";
import Carousel from "react-native-snap-carousel";
import CircleSnail from "react-native-progress/CircleSnail";
// redux
import { getRecommendedTags } from "../../../redux/actions/tag";
import { styles } from "../../../styles/Styles";

const { height, width } = Dimensions.get("screen");
export class PopularTags extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      tags: [],
    };

    this.mounted = true;
  }

  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = async () => {
    this.mounted && this.setState({ loading: true });
    const tags = await this.props.getRecommendedTags();
    this.mounted && this.setState({ loading: false, tags });
  };

  _renderItem = ({ item, index }) => {
    return (
      <TouchableHighlight
        style={{
          backgroundColor: "white",
          borderRadius: 20,
          alignItems: "center",
          justifyContent: "center",
          minWidth: width * 0.2,
          shadowColor: "black",
          shadowRadius: 5,
          paddingHorizontal: 10,
          height: height * 0.15,
        }}
        underlayColor="#6FF6FF"
        onPress={() => {
          this.props.setSelectedTag(item);
        }}
      >
        <Text style={styles.tagTitle}>{item.title}</Text>
      </TouchableHighlight>
    );
  };
  render() {
    const { tags, loading } = this.state;

    return (
      <View>
        {loading && (
          <View
            style={{
              position: "absolute",
              top: height * 0.075,
              left: width * 0.5,
            }}
          >
            <CircleSnail color={["black", "#6FF6FF"]} />
          </View>
        )}
        <Carousel
          ref={(c) => {
            this._carousel = c;
          }}
          data={tags}
          renderItem={this._renderItem}
          sliderWidth={width}
          itemWidth={width / 2}
          style={{ alignItems: "center", justifyContent: "space-evenly" }}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, {
  getRecommendedTags,
})(PopularTags);
