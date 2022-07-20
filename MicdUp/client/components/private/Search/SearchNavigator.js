import React, { Component } from "react";
import { connect } from "react-redux";
import { View } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import {
  navigationRefSearch,
  searchNavigate,
} from "../../../redux/actions/display";

// components
import { AntDesign } from "@expo/vector-icons";
import Feed from "../Feed/Feed";
import Profile from "../Profile/Profile";
import Search from "./Search";

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#000000",
  },
};
const Stack = createStackNavigator();

export class SearchNavigator extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
    };

    this.mounted = true;
  }

  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = () => {};

  render() {
    const {
      keyForSearch,
      currentProfile,
      searchViewingProfile,
      searchViewingTag,
    } = this.props;
    return (
      <NavigationContainer independent={true} style={{}} theme={MyTheme}>
        <Stack.Navigator
          initialRouteName={
            searchViewingProfile
              ? "SearchProfile"
              : searchViewingTag
              ? "SearchFeed"
              : "Search"
          }
        >
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
            }}
            name="SearchProfile"
            component={Profile}
            initialParams={{
              key: currentProfile ? currentProfile.id : "notloggedin",
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}

const mapStateToProps = (state) => ({
  currentProfile: state.display.viewingProfile,
  keyForSearch: state.display.keyForSearch,
  searchViewingTag: state.display.searchViewingTag,
  searchViewingProfile: state.display.searchViewingProfile,
});

export default connect(mapStateToProps, { searchNavigate })(SearchNavigator);
