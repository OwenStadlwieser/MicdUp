import React, { Component } from "react";
import { connect } from "react-redux";
// components
import { View, Text, Dimensions, TouchableHighlight } from "react-native";
import { SnapList, SnapItem } from "react-snaplist-carousel";
import CircleSnail from "react-native-progress/CircleSnail";
// actions
import { getRecommendedTags } from "../../../redux/actions/tag";

const { height, width } = Dimensions.get("screen");
export class RecommendedTags extends Component {
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

  render() {
    const { tags, loading } = this.state;

    return (
      <SnapList style={{ height: height * 0.15, flex: "initial" }}>
        {loading && (
          <View
            style={{
              position: "absolute",
              top: height * 0.075,
              left: width * 0.5,
            }}
          >
            <CircleSnail color={["white", "#1A3561", "#6FF6FF"]} />
          </View>
        )}
        {tags &&
          tags.map((tag, index) => (
            <SnapItem
              height={height * 0.15}
              margin={{ left: `15px` }}
              snapAlign="center"
              key={index}
            >
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
                }}
                underlayColor="#6FF6FF"
                onPress={() => {
                  console.log(tag);
                  this.props.setSelectedTag(tag._id);
                }}
              >
                <Text>{tag.title}</Text>
              </TouchableHighlight>
            </SnapItem>
          ))}
      </SnapList>
    );
  }
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, { getRecommendedTags })(
  RecommendedTags
);
