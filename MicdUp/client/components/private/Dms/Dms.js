import React, { Component } from "react";
import { connect } from "react-redux";
import { View } from "react-native";
export class Dms extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      chatMessage: "",
      chatMessages: [],
    };
    this.socket = {};
    this.mounted = true;
  }

  nmount = () => (this.mounted = false);

  componentDidMount = () => {
    this.socket = io("http://127.0.0.1:6002");
    this.socket.on("chat message", (msg) => {
      this.setState({ chatMessages: [...this.state.chatMessages, msg] });
    });
  };

  render() {
    return <View></View>;
  }
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, {})(Dms);
