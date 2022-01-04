import React, { Component } from "react";
import { connect } from "react-redux";
import { View, Text, TouchableOpacity } from "react-native";
// redux
import { viewProfile } from "../../redux/actions/display";
import { navigate } from "../../redux/actions/display";
// styles
import { styles } from "../../styles/Styles";

export class DefaultComponent extends Component {
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
    const { mountedComponent } = this.props;
    return (
      <View style={styles.navbar}>
        <TouchableOpacity
          style={
            mountedComponent === "Feed"
              ? styles.activeNavbarButton
              : styles.navbarButton
          }
          onPress={() => {
            this.props.navigate("Feed");
          }}
        >
          <Text style={styles.navbarText}>Feed</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={
            mountedComponent === "Search"
              ? styles.activeNavbarButton
              : styles.navbarButton
          }
          onPress={() => {
            this.props.navigate("Search");
          }}
        >
          <Text style={styles.navbarText}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={
            mountedComponent === "Create"
              ? styles.activeNavbarButton
              : styles.navbarButton
          }
          onPress={() => {
            this.props.navigate("Create");
          }}
        >
          <Text style={styles.navbarText}>Create</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={
            mountedComponent === "Chat"
              ? styles.activeNavbarButton
              : styles.navbarButton
          }
          onPress={() => {
            this.props.navigate("Chat");
          }}
        >
          <Text style={styles.navbarText}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={
            mountedComponent === "Profile"
              ? styles.activeNavbarButton
              : styles.navbarButton
          }
          onPress={() => {
            this.props.viewProfile(this.props.profile);
            this.props.navigate("Profile");
          }}
        >
          <Text style={styles.navbarText}>Profile</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  mountedComponent: state.display.mountedComponent,
  profile: state.auth.user.profile,
});

export default connect(mapStateToProps, { navigate, viewProfile })(
  DefaultComponent
);
