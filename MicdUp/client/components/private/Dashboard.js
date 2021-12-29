import React, { Component } from "react";
import { connect } from "react-redux";
import { Text, View } from "react-native";
// redux
import { getUserQuery } from "../../redux/actions/user";
import { navigate } from "../../redux/actions/display";
// children
import Create from "./create/Create";
import Dms from "./dms/Dms";
import Feed from "./feed/Feed";
import Live from "./live/Live";
import Profile from "./profile/Profile";
import Search from "./search/Search";
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
