import React, { Component } from "react";
import { connect } from "react-redux";
import { Text, View } from "react-native";
// redux
import { getUserQuery } from "../../redux/actions/user";
import { navigate } from "../../redux/actions/display";
// children
import Create from "./Create/Create";
import Dms from "./Dms/Dms";
import Feed from "./Feed/Feed";
import Live from "./Live/Live";
import Profile from "./Profile/Profile";
import Search from "./Search/Search";
// helpers
import { removeItemValue } from "../../reuseableFunctions/helpers";

export class Dashboard extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
    };

    this.mounted = true;
  }

  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = async () => {
    const { updateLoggedIn } = this.props;
    this.mounted && this.setState({ loading: true });
    await this.props.getUserQuery();
    const { user } = this.props;
    if (!user || Object.keys(user).length === 0) {
      console.log("User not logged in.", user);
      removeItemValue("token");
      updateLoggedIn(false);
    }
    this.mounted && this.setState({ loading: false });
  };

  render() {
    const { mountedComponent, user } = this.props;
    return (
      <View>
        {mountedComponent === "Feed" ? (
          <Feed />
        ) : mountedComponent === "Create" ? (
          <Create />
        ) : mountedComponent === "Dms" ? (
          <Dms />
        ) : mountedComponent === "Live" ? (
          <Live />
        ) : mountedComponent === "Profile" ? (
          <Profile />
        ) : mountedComponent === "Search" ? (
          <Search />
        ) : (
          <Feed />
        )}
        <Text>{user.userName}</Text>
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  mountedComponent: state.display.mountedComponent,
  user: state.auth.user,
});

export default connect(mapStateToProps, {
  navigate,
  getUserQuery,
})(Dashboard);
