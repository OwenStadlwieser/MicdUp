import { StatusBar } from "expo-status-bar";
import { Text, View, Dimensions, SafeAreaView } from "react-native";
import { Button } from "react-native-paper";
import React, { Component, Fragment, useEffect } from "react";
import { connect } from "react-redux";
// styles
import { styles } from "./styles/Styles";
// redux
import { setIp } from "./redux/actions/auth";
import { changeLogin, changeSignup } from "./redux/actions/display";
// children
import Comment from "./components/reuseable/Comment";
import Dashboard from "./components/private/Dashboard";
import Navbar from "./components/private/Navbar";
import Login from "./components/public/Login";
import Signup from "./components/public/Signup";
import Feed from "./components/private/Feed/Feed";
import SoundPlayer from "./components/reuseable/SoundPlayer";
import CircleSnail from "react-native-progress/CircleSnail";
import NotificationBell from "./components/private/NotificationBell";
// helpers
import publicIP from "react-native-public-ip";
import { getData } from "./reuseableFunctions/helpers";

import { Audio } from "expo-av";
import Search from "./components/private/Search/Search";

export class Root extends Component {
  constructor() {
    super();
    this.state = {
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
      loading,
      showingComments,
      cachedPosts,
      currentKey,
      postIndex,
      keyForSearch,
      showHeader,
    } = this.props;
    let app;
    if (!loggedIn && !token)
      app = (
        <SafeAreaView style={styles.rootContainer}>
          {loading && (
            <View style={styles.loadingContainer}>
              <CircleSnail size={60} color={["white", "#1A3561", "#6FF6FF"]} />
            </View>
          )}
          {showHeader && <SoundPlayer />}
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
                <Feed key={"notloggedin"} />
              </View>
              <Navbar />
            </View>
          ) : mountedComponent === "Search" ? (
            <View style={styles.containerPrivate}>
              <View style={styles.contentContainer}>
                <Search key={keyForSearch} />
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
                <Button
                  style={styles.button}
                  onPress={() => {
                    this.props.changeLogin(true);
                  }}
                >
                  Login
                </Button>
                <Button
                  style={styles.button}
                  onPress={() => {
                    this.props.changeSignup(true);
                  }}
                >
                  Sign Up
                </Button>
                <StatusBar style="auto" />
              </View>
              <Navbar />
            </View>
          )}
          {showingComments && (
            <Comment
              containerStyle={{}}
              color={"#1A3561"}
              post={cachedPosts[currentKey][postIndex]}
            />
          )}
        </SafeAreaView>
      );
    else
      app = (
        <View style={{ display: "grid", gridTemplateRows: "9fr 1fr" }}>
          {loading && (
            <View style={styles.loadingContainer}>
              <CircleSnail size={60} color={["white", "#1A3561", "#6FF6FF"]} />
            </View>
          )}
          {showHeader && (
            <Fragment>
              <SoundPlayer />
              <NotificationBell />
            </Fragment>
          )}
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
          {showingComments && cachedPosts[currentKey] && (
            <Comment
              containerStyle={{}}
              color={"#1A3561"}
              post={cachedPosts[currentKey][postIndex]}
            />
          )}
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
  loading: state.display.loading,
  showingComments: state.display.showingComments,
  postIndex: state.display.postIndex,
  cachedPosts: state.auth.posts,
  currentKey: state.auth.currentKey,
  keyForSearch: state.display.keyForSearch,
  showHeader: state.display.showHeader,
});
export default connect(mapStateToProps, {
  changeSignup,
  changeLogin,
  setIp,
})(Root);
