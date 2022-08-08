import React, { Component } from "react";
import { connect } from "react-redux";
import { ScrollView, View, TouchableOpacity, Text, Alert } from "react-native";
// styles
import { styles } from "../../../styles/Styles";
// icons
import { AntDesign } from "@expo/vector-icons";
// redux
import { logout } from "../../../redux/actions/auth";
import { deleteAccount } from "../../../redux/actions/user";
//components
import VerifyEmail from "./VerifyEmail";

export class Settings extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      verifyEmail: false,
    };

    this.mounted = true;
  }

  nmount = () => (this.mounted = false);

  componentDidMount = () => {};

  hideVerifyEmail = () => {
    this.mounted && this.setState({ verifyEmail: false });
  };

  render() {
    const { verifyEmail } = this.state;
    let settings;
    verifyEmail
      ? (settings = (
          <VerifyEmail hideVerifyEmail={this.hideVerifyEmail.bind(this)} />
        ))
      : (settings = (
          <View style={styles.pane}>
            <ScrollView
              scrollEnabled={true}
              style={styles.settingsOptionsContainer}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
            >
              <TouchableOpacity
                style={styles.settingsOption}
                onPress={async () => {
                  await this.props.logout();
                }}
              >
                <AntDesign
                  name="logout"
                  size={24}
                  color="black"
                  style={styles.logoutIcon}
                />
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.settingsOption}
                onPress={async () => {
                  await this.props.deleteAccount();
                  await this.props.logout();
                }}
              >
                <Text style={styles.logoutText}>Delete Account</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        ));
    return settings;
  }
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, { logout, deleteAccount })(Settings);
