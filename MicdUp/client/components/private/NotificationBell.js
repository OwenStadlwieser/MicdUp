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
const { width, height } = Dimensions.get("window");

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
    const { navigate } = this.props;
    return (
      <Text style={[styles.toptopRightIcon, { zIndex: 50 }]}>
        <MaterialCommunityIcons
          onPress={() => navigate("Notifs")}
          name="bell"
          size={24}
          color="white"
        />
      </Text>
    );
  }
}

const mapStateToProps = (state) => ({
  mountedComponent: state.display.mountedComponent,
});

export default connect(mapStateToProps, { navigate })(NotificationBell);
