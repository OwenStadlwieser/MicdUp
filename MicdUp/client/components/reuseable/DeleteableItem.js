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
    const { onDelete, item, title, style, color, icon = "delete" } = this.props;
    return (
      <Button
        icon={icon}
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
