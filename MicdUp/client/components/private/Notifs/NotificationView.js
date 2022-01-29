import React, { Component } from "react";
import { connect } from "react-redux";
import { FlatList, View } from "react-native";
export class NotificationView extends Component {
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
    
    const {
        Notifications,
    } = this.props;

    return (<View>
        <FlatList></FlatList>
    </View>);
  }
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, {})(NotificationView);
