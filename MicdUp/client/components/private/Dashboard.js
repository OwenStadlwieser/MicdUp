import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { Text, View, Dimensions } from "react-native";
// redux
import { getUserQuery } from "../../redux/actions/user";
import { logout, setSocket } from "../../redux/actions/auth";
import { chatRecieved } from "../../redux/actions/chat";
import { getUserNotifs } from "../../redux/actions/notifs";
import { addLoading, removeLoading } from "../../redux/actions/display";
import {
  navigationRef,
  navigateStateChanged,
} from "../../redux/actions/display";
// children
import Create from "./Create/Create";
import Dms from "./Dms/Dms";
import Feed from "./Feed/Feed";
import Comment from "../reuseable/Comment";
import Profile from "./Profile/Profile";
import Settings from "./Profile/Settings";
import Navbar from "./Navbar";
import Search from "./Search/Search";
import ListOfAccounts from "../reuseable/ListOfAccounts";
import Chat from "./Dms/Chat";
import SinglePostContainer from "../reuseable/SinglePostContainer";
// helpers
import { getData } from "../../reuseableFunctions/helpers";
import { io } from "socket.io-client";
//styles
import { styles } from "../../styles/Styles";
import NotificationView from "./Notifs/NotificationView";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import Header from "../reuseable/Header";

const { width, height } = Dimensions.get("window");

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#1A3561",
  },
};
const Stack = createStackNavigator();

export class Dashboard extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
    };

    this.mounted = true;
  }

  componentWillUnmount = () => {
    this.props.removeLoading("Dashboard");
    this.mounted = false;
  };

  componentDidMount = async () => {
    this.props.addLoading("Dashboard");
    const { chatRecieved } = this.props;
    await this.props.getUserQuery();
    await this.props.getUserNotifs(0);
    const { user } = this.props;
    if (!user || Object.keys(user).length === 0) {
      this.props.logout();
    } else {
      const token = await getData("token");
      const socket = io.connect("http://localhost:6002/");
      socket.emit("new user", token);
      socket.on("new message", async function (message, chatId) {
        console.log("recieved", message);
        chatRecieved(message, chatId);
      });
      this.props.setSocket(socket);
    }
    this.props.removeLoading("Dashboard");
  };

  render() {
    const {
      mountedComponent,
      user,
      keyForSearch,
      profile,
      cachedPosts,
      currentKey,
      postIndex,
      title,
      userName,
      activeChatMembers,
      currentProfile,
    } = this.props;
    return (
      <Fragment>
        <NavigationContainer
          style={{ width }}
          theme={MyTheme}
          ref={navigationRef}
          screenOptions={{ headerShown: true }}
          gestureResponseDista
        >
          <Stack.Navigator
            screenListeners={{
              state: (e) => {
                // Do something with the state
                this.props.navigateStateChanged(
                  e.data.state.routeNames[e.data.state.index]
                );
              },
            }}
            screenOptions={{
              headerStyle: {
                backgroundColor: "#1A3561",
              },
              headerTintColor: "#fff",
              headerTitleStyle: {
                fontWeight: "bold",
              },
              headerRight: () => <Header />,
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
              name="SinglePostContainer"
              component={SinglePostContainer}
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
              name="Settings"
              component={Settings}
              initialParams={{ key: this.props.loggedIn }}
              options={{ headerShown: true }}
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
              options={{ headerShown: true }}
              name="Create"
              component={Create}
            />
            <Stack.Screen
              initialParams={{
                post: cachedPosts[currentKey]
                  ? cachedPosts[currentKey][postIndex]
                  : {},
              }}
              name="Comment"
              component={Comment}
            />
            <Stack.Screen
              options={{ headerShown: true }}
              name="Dms"
              component={Dms}
            />
            <Stack.Screen
              options={{ headerShown: true }}
              name="Profile"
              component={Profile}
              initialParams={{
                userName: user && user.userName ? user.userName : "",
                id: profile ? profile.id : "",
                key: profile ? profile.id : "notloggedin",
              }}
            />
            <Stack.Screen
              name="Notifs"
              options={{ headerShown: true }}
              component={NotificationView}
            />
            <Stack.Screen
              name="Chat"
              options={{
                headerShown: true,
                headerTitle:
                  "Members: " +
                  activeChatMembers
                    .filter((member) => member)
                    .map((member, res) => {
                      return userName !== member.user.userName
                        ? member.user.userName + ", "
                        : "";
                    }),
              }}
              component={Chat}
            />
          </Stack.Navigator>
        </NavigationContainer>

        <Navbar />
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  mountedComponent: state.display.mountedComponent,
  user: state.auth.user,
  loggedIn: state.auth.loggedIn,
  profile: state.auth.user.profile,
  keyForSearch: state.display.keyForSearch,
  postIndex: state.display.postIndex,
  cachedPosts: state.auth.posts,
  currentKey: state.auth.currentKey,
  title: state.display.list,
  activeChatMembers: state.chat.activeChatMembers,
  userName: state.auth.user.userName,
  currentProfile: state.display.viewingProfile,
});

export default connect(mapStateToProps, {
  getUserQuery,
  logout,
  setSocket,
  chatRecieved,
  addLoading,
  removeLoading,
  navigateStateChanged,
  getUserNotifs,
})(Dashboard);
