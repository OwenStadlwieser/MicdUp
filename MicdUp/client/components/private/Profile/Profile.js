import React, { Component } from "react";
import { connect } from "react-redux";
import { TouchableOpacity, View, Text } from "react-native";
// icons
import { Ionicons } from "@expo/vector-icons";
// styles
import { styles } from "../../../styles/Styles";
// children
import Settings from "./Settings";

export class Profile extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      settingsShown: false,
    };

    this.mounted = true;
  }

  nmount = () => (this.mounted = false);

  componentDidMount = () => {};

  hideSetting = () => {
    this.mounted && this.setState({ settingsShown: false });
  };
  render() {
    const { settingsShown } = this.state;
    const { user } = this.props;
    return (
      <View style={styles.pane}>
        {!settingsShown && (
          <Ionicons
            onPress={() => {
              this.mounted && this.setState({ settingsShown: true });
            }}
            name="settings-outline"
            size={24}
            color="white"
            style={styles.topRightIcon}
          />
        )}
        {settingsShown ? (
          <Settings hideSetting={this.hideSetting.bind(this)} />
        ) : (
          <Text>{user.userName}</Text>
        )}
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.auth.user,
});

export default connect(mapStateToProps, {})(Profile);
