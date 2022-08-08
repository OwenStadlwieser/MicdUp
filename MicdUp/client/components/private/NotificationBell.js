import React, { Component } from "react";
import { connect } from "react-redux";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Text,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { navigate } from "../../redux/actions/display";
import { styles } from "../../styles/Styles";

export class NotificationBell extends Component {
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
    const { navigate, unseenNotifs } = this.props;
    return (
      <Text>
        <Text style={{ fontStyle: "italic", color: "white" }}>
          {unseenNotifs}
        </Text>
        <MaterialCommunityIcons
          onPress={() => navigate("Notifs")}
          name="bell"
          size={24}
          color={unseenNotifs > 0 ? "red" : "white"}
        />
      </Text>
    );
  }
}

const mapStateToProps = (state) => ({
  mountedComponent: state.display.mountedComponent,
  unseenNotifs: state.notifs.unseenNotifs,
});

export default connect(mapStateToProps, { navigate })(NotificationBell);
