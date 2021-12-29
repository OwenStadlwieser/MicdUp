import React, { Component } from "react";
import { connect } from "react-redux";
import { View } from "react-native";
export class Live extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
    };

    this.mounted = true;
  }

  nmount = () => (this.mounted = false);

  componentDidMount = () => {};

  render() {
    return <View></View>;
  }
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, {})(Live);
