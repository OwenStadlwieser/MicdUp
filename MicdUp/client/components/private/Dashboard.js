import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { Text, View, Dimensions } from "react-native";
// redux
import { getUserQuery } from "../../redux/actions/user";
import { logout, setSocket } from "../../redux/actions/auth";
import { chatRecieved } from "../../redux/actions/chat";
import { addLoading, removeLoading } from "../../redux/actions/display";
import {
  navigationRef,
  navigateStateChanged,
} from "../../redux/actions/display";
// children
import Create from "./Create/Create";
import Dms from "./Dms/Dms";
import Feed from "./Feed/Feed";
import Live from "./Live/Live";
import Profile from "./Profile/Profile";
import Search from "./Search/Search";
import Navbar from "./Navbar";
// helpers
import { getData } from "../../reuseableFunctions/helpers";
import { io } from "socket.io-client";
//styles
import { styles } from "../../styles/Styles";
import NotificationView from "./Notifs/NotificationView";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";

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
    const { mountedComponent, user, keyForSearch, profile } = this.props;
    return (
      <Fragment>
        <NavigationContainer
          style={{ width }}
          theme={MyTheme}
          ref={navigationRef}
          screenOptions={{ headerShown: false }}
        >
          <Stack.Navigator
            screenListeners={{
              state: (e) => {
                // Do something with the state
                this.props.navigateStateChanged(e.data);
              },
            }}
            initialRouteName={mountedComponent}
          >
            <Stack.Screen
              name="Feed"
              component={Feed}
              key={this.props.loggedIn}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Search"
              key={keyForSearch}
              component={Search}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              options={{ headerShown: false }}
              name="Create"
              component={Create}
            />
            <Stack.Screen
              options={{ headerShown: false }}
              name="Dms"
              component={Dms}
            />
            <Stack.Screen
              options={{ headerShown: false }}
              name="Profile"
              component={Profile}
              key={profile ? profile.id : "notloggedin"}
              id={profile ? profile.id : ""}
              userName={user && user.userName ? user.userName : ""}
            />
            <Stack.Screen
              name="Notifs"
              options={{ headerShown: false }}
              component={NotificationView}
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
});

export default connect(mapStateToProps, {
  getUserQuery,
  logout,
  setSocket,
  chatRecieved,
  addLoading,
  removeLoading,
  navigateStateChanged,
})(Dashboard);
