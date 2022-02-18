import React, { Component } from "react";
import { connect } from "react-redux";
import { Text, View } from "react-native";
// redux
import { getUserQuery } from "../../redux/actions/user";
import { logout, setSocket } from "../../redux/actions/auth";
import { chatRecieved } from "../../redux/actions/chat";
// children
import Create from "./Create/Create";
import Dms from "./Dms/Dms";
import Feed from "./Feed/Feed";
import Live from "./Live/Live";
import Profile from "./Profile/Profile";
import Search from "./Search/Search";
import Navbar from "./Navbar";
// helpers
import { removeItemValue, getData } from "../../reuseableFunctions/helpers";
import { io } from "socket.io-client";
//styles
import { styles } from "../../styles/Styles";
import NotificationView from "./Notifs/NotificationView";

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
    this.mounted && this.setState({ loading: false });
  };

  render() {
    const { mountedComponent, user, keyForSearch } = this.props;
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
            <Profile
              id={user && user.profile ? user.profile.id : ""}
              userName={user && user.userName ? user.userName : ""}
            />
          ) : mountedComponent === "Search" ? (
            <Search key={keyForSearch} />
          ) : mountedComponent === "Notifs" ? (
            <NotificationView />
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
  keyForSearch: state.display.keyForSearch,
});

export default connect(mapStateToProps, {
  getUserQuery,
  logout,
  setSocket,
  chatRecieved,
})(Dashboard);
