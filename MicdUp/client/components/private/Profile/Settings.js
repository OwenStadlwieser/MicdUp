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

export class Settings extends Component {
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
    return (
      <View style={styles.pane}>
        <AntDesign
          style={styles.topLeftIcon}
          name="leftcircle"
          size={24}
          color="white"
          onPress={() => {
            this.props.hideSetting();
          }}
        />
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
          <TouchableOpacity style={styles.settingsOption}>
            <Text>Option 2</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsOption}>
            <Text>Option 3</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsOption}>
            <Text>Option 4</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsOption}>
            <Text>Option 5</Text>
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
    );
  }
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, { logout, deleteAccount })(Settings);
