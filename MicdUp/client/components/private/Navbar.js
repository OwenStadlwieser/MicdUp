import React, { Component } from "react";
import { connect } from "react-redux";
import { View, Text, TouchableOpacity } from "react-native";
// redux
import { viewProfile } from "../../redux/actions/display";
import { navigate } from "../../redux/actions/display";
import { withNavigation } from "react-navigation";
// styles
import { styles } from "../../styles/Styles";
// icons
import { FontAwesome } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";

export class NavBar extends Component {
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
    console.log(mountedComponent);
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
          <Text style={styles.navbarText}>
            <FontAwesome
              name="feed"
              size={24}
              color={mountedComponent === "Feed" ? "#6FF6FF" : "black"}
            />
          </Text>
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
          <Text style={styles.navbarText}>
            <FontAwesome
              name="search"
              size={24}
              color={mountedComponent === "Search" ? "#6FF6FF" : "black"}
            />
          </Text>
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
          <Text style={styles.navbarText}>
            <FontAwesome5
              name="record-vinyl"
              size={36}
              color={mountedComponent === "Create" ? "#6FF6FF" : "red"}
            />
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={
            mountedComponent === "Dms"
              ? styles.activeNavbarButton
              : styles.navbarButton
          }
          onPress={() => {
            this.props.navigate("Dms");
          }}
        >
          <Text style={styles.navbarText}>
            <FontAwesome
              name="users"
              size={24}
              color={mountedComponent === "Dms" ? "#6FF6FF" : "black"}
            />
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={
            mountedComponent === "Profile"
              ? styles.activeNavbarButton
              : styles.navbarButton
          }
          onPress={() => {
            this.props.viewProfile({
              ...this.props.profile,
              user: { userName: this.props.userName },
            });
            this.props.navigate("Profile");
          }}
        >
          <Text style={styles.navbarText}>
            <FontAwesome
              name="user"
              size={24}
              color={mountedComponent === "Profile" ? "#6FF6FF" : "black"}
            />
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  mountedComponent: state.display.mountedComponent,
  profile: state.auth.user.profile,
  userName: state.auth.user.userName,
});

export default connect(mapStateToProps, { navigate, viewProfile })(NavBar);
