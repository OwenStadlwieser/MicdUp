import { StatusBar } from "expo-status-bar";
import { Text, View, TouchableOpacity } from "react-native";
import { getUserQuery } from "./redux/actions/user";
import React, { Component } from "react";
import { connect } from "react-redux";
import { styles } from "./styles/dashboardStyles";
import { changeLogin, changeSignup } from "./redux/actions/display";
import Login from "./components/public/Login";
import Signup from "./components/public/Signup";
import { getData } from "./reuseableFunctions/helpers";

export class Root extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      userId: "",
      token: "",
      loggedIn: false,
    };

    this.mounted = true;
  }

  componentWillUnmount = () => {
    this.mounted = false;
  };

  componentDidMount = async () => {
    const res = await this.props.getUserQuery();
    this.mounted && this.setState({ userId: res ? res.id : "" });
    const token = await getData("token");
    this.mounted && this.setState({ token });
  };
  componentDidUpdate = async (prevProps, prevState) => {
    const { loggedIn, token } = this.state;
    if (loggedIn && (!token || token !== prevState.token)) {
      const token = await getData("token");
      this.mounted && this.setState({ token });
    }
  };
  updateLoggedIn = (loggedIn) => {
    this.mounted && this.setState({ loggedIn });
  };
  render() {
    const { userId, token } = this.state;
    const {
      showLogin,
      showSignup,
      displayMessage,
      currentMessage,
      messageState,
    } = this.props;
    let app;
    if (!token)
      app = (
        <View style={styles.rootContainer}>
          {displayMessage && (
            <View style={styles.messageContainer}>
              <Text
                style={messageState ? styles.goodMessage : styles.badMessage}
              >
                {currentMessage}
              </Text>
            </View>
          )}
          {showLogin ? (
            <Login updateLoggedIn={this.updateLoggedIn.bind(this)} />
          ) : showSignup ? (
            <Signup />
          ) : (
            <View style={styles.container}>
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
              <Text>
                A userId in db is {userId}. Don't forget to fix getUser to
                change behavior
              </Text>
              <StatusBar style="auto" />
            </View>
          )}
        </View>
      );
    else
      app = (
        <View style={styles.rootContainer}>
          <View style={styles.messageContainer}>
            <Text style={messageState ? styles.goodMessage : styles.badMessage}>
              Logged in
            </Text>
          </View>
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
});
export default connect(mapStateToProps, {
  getUserQuery,
  changeSignup,
  changeLogin,
})(Root);
