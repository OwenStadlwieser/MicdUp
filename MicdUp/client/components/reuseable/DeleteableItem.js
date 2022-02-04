import React, { Component } from "react";
import { connect } from "react-redux";
import { View } from "react-native";
import { Button } from "react-native-paper";
export class DeleteableItem extends Component {
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
    const { onDelete, item, title, style, color } = this.props;
    return (
      <Button
        icon="delete"
        color={color}
        mode="contained"
        onPress={onDelete}
        style={style}
      >
        {item[title]}
      </Button>
    );
  }
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, {})(DeleteableItem);
