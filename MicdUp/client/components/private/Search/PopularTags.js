import React, { Component } from "react";
import { connect } from "react-redux";
import { View, Text, Dimensions } from "react-native";
import { SnapList, SnapItem } from "react-snaplist-carousel";
import { getPopularTags } from "../../../redux/actions/tag";
const { height, width } = Dimensions.get("screen");
export class DefaultComponent extends Component {
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
    const tags = await this.props.getPopularTags();
    console.log(tags);
    this.mounted && this.setState({ loading: false, tags });
  };

  render() {
    const { tags } = this.state;
    const settings = {
      dots: false,
      slidesToShow: 2,
      slidesToScroll: 2,
      variableWidth: true,
    };
    return (
      <SnapList style={{}}>
        {tags &&
          tags.map((tag, index) => (
            <SnapItem
              height={height * 0.15}
              margin={{ left: `15px` }}
              snapAlign="center"
              key={index}
            >
              <View
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
              >
                <Text>{tag.title}</Text>
              </View>
            </SnapItem>
          ))}
      </SnapList>
    );
  }
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, { getPopularTags })(DefaultComponent);
