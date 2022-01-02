import React, { Component } from "react";
import { connect } from "react-redux";
import { Text, View } from "react-native";
// redux
import { getUserQuery } from "../../redux/actions/user";
import { logout } from "../../redux/actions/auth";
// children
import Create from "./Create/Create";
import Dms from "./Dms/Dms";
import Feed from "./Feed/Feed";
import Live from "./Live/Live";
import Profile from "./Profile/Profile";
import Search from "./Search/Search";
import Navbar from "./Navbar";
// helpers
import { removeItemValue } from "../../reuseableFunctions/helpers";
//styles
import { styles } from "../../styles/Styles";

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
    this.mounted && this.setState({ loading: true });
    await this.props.getUserQuery();
    const { user } = this.props;
    if (!user || Object.keys(user).length === 0) {
      this.props.logout();
    }
    this.mounted && this.setState({ loading: false });
  };

  render() {
    const { mountedComponent, user } = this.props;
    return (
      <View style={styles.containerPrivate}>
        <View style={styles.contentContainer}>
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
        </View>
        <Navbar />
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  mountedComponent: state.display.mountedComponent,
  user: state.auth.user,
});

export default connect(mapStateToProps, {
  getUserQuery,
  logout,
})(Dashboard);
