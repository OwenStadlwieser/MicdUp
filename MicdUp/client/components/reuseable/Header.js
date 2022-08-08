import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { View, Dimensions } from "react-native";
import SoundPlayer from "./SoundPlayer";
import NotificationBell from "../private/NotificationBell";

const { width, height } = Dimensions.get("screen");
export class Header extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
    };

    this.mounted = true;
  }

  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = () => {};

  render() {
    const { showHeader } = this.props;
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-evenly",
          alignItems: "center",
          width: width * 0.3,
        }}
      >
        <SoundPlayer />
        <NotificationBell />
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  showHeader: state.display.showHeader,
});

export default connect(mapStateToProps, {})(Header);
