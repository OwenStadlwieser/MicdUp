import { StatusBar } from "expo-status-bar";
import { Text, View, TouchableOpacity, Platform } from "react-native";
import React, { Component, useEffect } from "react";
import { connect } from "react-redux";
// styles
import { styles } from "./styles/Styles";
// redux
import { setIp } from "./redux/actions/auth";
import { changeLogin, changeSignup } from "./redux/actions/display";
// children
import Dashboard from "./components/private/Dashboard";
import Navbar from "./components/private/Navbar";
import Login from "./components/public/Login";
import Signup from "./components/public/Signup";
import Feed from "./components/private/Feed/Feed";
import Create from "./components/private/Create/Create";
import SoundPlayer from "./components/reuseable/SoundPlayer";
// helpers
import publicIP from "react-native-public-ip";
import { getData } from "./reuseableFunctions/helpers";
import NotificationBell from "./components/private/NotificationBell";

import { Audio } from "expo-av";
import Search from "./components/private/Search/Search";

export class Root extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      token: "",
      loggedIn: false,
    };

    this.mounted = true;
  }

  componentWillUnmount = () => {
    this.mounted = false;
  };

  componentDidMount = async () => {
    publicIP()
      .then((ip) => {
        console.log(ip);
        this.props.setIp("1234");
        // '47.122.71.234'
      })
      .catch((error) => {
        console.log(error);
        this.props.setIp("1234");
        // 'Unable to get IP address.'
      });
    const token = await getData("token");
    this.mounted && this.setState({ token });
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      allowsRecordingIOS: false,
    });
  };
  componentDidUpdate = async (prevProps, prevState) => {
    const { token } = this.state;
    const { loggedIn } = this.props;
    if (loggedIn && (!token || token !== prevState.token)) {
      const token = await getData("token");
      this.mounted && this.setState({ token });
    }
    if (!loggedIn && prevProps.loggedIn) {
      const token = await getData("token");
      this.mounted && this.setState({ token });
    }
  };

  render() {
    const { token } = this.state;
    const {
      showLogin,
      showSignup,
      displayMessage,
      currentMessage,
      messageState,
      loggedIn,
      mountedComponent,
    } = this.props;
    let app;
    if (!loggedIn && !token)
      app = (
        <View style={styles.rootContainer}>
          <SoundPlayer />
          {displayMessage && (
            <View style={styles.messageContainer}>
              <Text
                style={messageState ? styles.goodMessage : styles.badMessage}
              >
                {currentMessage}
              </Text>
            </View>
          )}
          {mountedComponent === "Feed" ? (
            <View style={styles.containerPrivate}>
              <View style={styles.contentContainer}>
                <Feed />
              </View>
              <Navbar />
            </View>
          ) : mountedComponent === "Search" ? (
            <View style={styles.containerPrivate}>
              <View style={styles.contentContainer}>
                <Search />
              </View>
              <Navbar />
            </View>
          ) : showLogin ? (
            <Login />
          ) : showSignup ? (
            <Signup />
          ) : (
            <View style={styles.containerPrivate}>
              <View style={styles.contentContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    this.props.changeLogin(true);
                  }}
                  accessibilityLabel="Login"
                >
                  <Text style={styles.text}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    this.props.changeSignup(true);
                  }}
                  accessibilityLabel="Sign Up"
                >
                  <Text style={styles.text}>Sign Up</Text>
                </TouchableOpacity>
                <StatusBar style="auto" />
              </View>
              <Navbar />
            </View>
          )}
        </View>
      );
    else
      app = (
        <View style={styles.rootContainer}>
          <SoundPlayer />
          <NotificationBell />
          {displayMessage && (
            <View style={styles.messageContainer}>
              <Text
                style={messageState ? styles.goodMessage : styles.badMessage}
              >
                {currentMessage}
              </Text>
            </View>
          )}
          <Dashboard></Dashboard>
        </View>
      );
    return app;
  }
}

const mapStateToProps = (state) => ({
  loggedIn: state.auth.loggedIn,
  showLogin: state.display.showLogin,
  showSignup: state.display.showSignup,
  displayMessage: state.display.displayMessage,
  currentMessage: state.display.currentMessage,
  messageState: state.display.messageState,
  mountedComponent: state.display.mountedComponent,
});
export default connect(mapStateToProps, {
  changeSignup,
  changeLogin,
  setIp,
})(Root);
