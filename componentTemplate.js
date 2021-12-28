import React, { Component } from "react";
import { connect } from "react-redux";
import { View } from "react-native";
export class DefaultComponent extends Component {
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
    return <div></div>;
  }
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, {})(DefaultComponent);
