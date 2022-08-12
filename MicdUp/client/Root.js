import { Text, View, StatusBar } from "react-native";
import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
// styles
import { styles } from "./styles/Styles";
// redux
import { setIp } from "./redux/actions/auth";
import { navigationRef, navigateStateChanged } from "./redux/actions/display";
import { changeSound, pauseSound } from "./redux/actions/sound";
// children
import LoginManager from "./components/reuseable/LoginManager";
import Comment from "./components/reuseable/Comment";
import Dashboard from "./components/private/Dashboard";
import Navbar from "./components/private/Navbar";
import Login from "./components/public/Login";
import Signup from "./components/public/Signup";
import Feed from "./components/private/Feed/Feed";
import SoundPlayer from "./components/reuseable/SoundPlayer";
import CircleSnail from "react-native-progress/CircleSnail";
import Search from "./components/private/Search/Search";
import Profile from "./components/private/Profile/Profile";
import ListOfAccounts from "./components/reuseable/ListOfAccounts";
import VerifyEmail from "./components/private/Profile/VerifyEmail";
// helpers
import publicIP from "react-native-public-ip";
import { getData } from "./reuseableFunctions/helpers";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { Audio } from "expo-av";
import SoundModal from "./components/reuseable/SoundModal";
import { STATUS_BAR_STYLE } from "./reuseableFunctions/constantsshared";
import MusicControl from "./components/reuseable/MusicControl";

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#000000",
  },
};
const Stack = createStackNavigator();

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
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      allowsRecordingIOS: true,
      staysActiveInBackground: true,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DUCK_OTHERS,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
      playThroughEarpieceAndroid: false,
    });
    StatusBar.setBarStyle(STATUS_BAR_STYLE);
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
      displayMessage,
      currentMessage,
      messageState,
      loggedIn,
      mountedComponent,
      loading,
      keyForSearch,
      showHeader,
      title,
      currentProfile,
      showingSoundModal,
    } = this.props;
    let app;

    if (!loggedIn && !token)
      app = (
        <Fragment>
          <MusicControl />
          <NavigationContainer
            theme={MyTheme}
            ref={navigationRef}
            screenOptions={{ headerShown: true }}
          >
            <Stack.Navigator
              screenListeners={{
                state: (e) => {
                  // Do something with the state
                  console.log(e.data);
                  this.props.navigateStateChanged(
                    e.data.state.routeNames[e.data.state.index]
                  );
                },
              }}
              screenOptions={{
                headerStyle: {
                  backgroundColor: "#000000",
                },
                headerTintColor: "#fff",
                headerTitleStyle: {
                  fontWeight: "bold",
                },
                headerRight: () => <SoundPlayer />,
              }}
              initialRouteName={mountedComponent}
            >
              <Stack.Screen
                name="Feed"
                component={Feed}
                initialParams={{ key: this.props.loggedIn }}
                options={{ headerShown: true }}
              />
              <Stack.Screen
                name="ListOfAccounts"
                component={ListOfAccounts}
                initialParams={{ key: this.props.loggedIn }}
                options={{ headerShown: true, headerTitle: title }}
              />
              <Stack.Screen
                name="Search"
                initialParams={{ key: keyForSearch }}
                component={Search}
                options={{ headerShown: true }}
              />
              <Stack.Screen
                name="SearchFeed"
                component={Feed}
                initialParams={{
                  key: this.props.loggedIn,
                  fromSearch: true,
                }}
                options={{ headerShown: true }}
              />
              <Stack.Screen
                options={{
                  headerShown: true,
                  headerTitle: currentProfile
                    ? currentProfile.user
                      ? currentProfile.user.userName
                      : "SearchProfile"
                    : "SearchProfile",
                }}
                name={"SearchProfile"}
                component={Profile}
                initialParams={{
                  key: currentProfile ? currentProfile.id : "notloggedin",
                }}
              />
              <Stack.Screen
                name="Create"
                component={LoginManager}
                options={{ headerShown: true }}
              />
              <Stack.Screen
                name="Dms"
                component={LoginManager}
                options={{ headerShown: true }}
              />
              <Stack.Screen
                name="Profile"
                component={LoginManager}
                options={{ headerShown: true }}
              />
              <Stack.Screen
                initialParams={{}}
                name="Comment"
                component={Comment}
              />
              <Stack.Screen name="Login" component={Login} />
              <Stack.Screen name="Signup" component={Signup} />
              <Stack.Screen name="VerifyEmail" component={VerifyEmail} />
            </Stack.Navigator>
          </NavigationContainer>
          <Navbar />
          {loading && (
            <View style={styles.loadingContainer}>
              <CircleSnail size={60} color={["white", "#6FF6FF"]} />
            </View>
          )}
          {showingSoundModal && <SoundModal />}
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
        </Fragment>
      );
    else
      app = (
        <Fragment>
          <MusicControl />

          {loading && (
            <View style={styles.loadingContainer}>
              <CircleSnail size={60} color={["white", "#6FF6FF"]} />
            </View>
          )}
          <Dashboard></Dashboard>
          {showingSoundModal && <SoundModal />}
          {displayMessage && (
            <View style={styles.messageContainer}>
              <Text
                style={messageState ? styles.goodMessage : styles.badMessage}
              >
                {currentMessage}
              </Text>
            </View>
          )}
        </Fragment>
      );
    return app;
  }
}

const mapStateToProps = (state) => ({
  loggedIn: state.auth.loggedIn,
  displayMessage: state.display.displayMessage,
  currentMessage: state.display.currentMessage,
  messageState: state.display.messageState,
  mountedComponent: state.display.mountedComponent,
  loading: state.display.loading,
  keyForSearch: state.display.keyForSearch,
  showHeader: state.display.showHeader,
  title: state.display.list,
  userName: state.auth.user.userName,
  currentProfile: state.display.viewingProfile,
  showingSoundModal: state.display.showingSoundModal,
  currentPlayingSound: state.sound.currentPlayingSound,
  currentIntervalId: state.sound.currentIntervalId,
  time: state.sound.time,
});
export default connect(mapStateToProps, {
  setIp,
  navigateStateChanged,
  changeSound,
  pauseSound,
})(Root);
