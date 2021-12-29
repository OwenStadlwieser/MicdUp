import { StatusBar } from "expo-status-bar";
import { Text, View, TouchableOpacity } from "react-native";
import React, { Component } from "react";
import { connect } from "react-redux";
// styles
import { styles } from "./styles/Styles";
// redux
import { changeLogin, changeSignup } from "./redux/actions/display";
// children
import Dashboard from "./components/private/Dashboard";
import Login from "./components/public/Login";
import Signup from "./components/public/Signup";
// helpers
import { getData } from "./reuseableFunctions/helpers";

export class Root extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      token: "",
      loggedIn: false,
    };

    this.mounted = true;
  }

  componentWillUnmount = () => {
    this.mounted = false;
  };

  componentDidMount = async () => {
    const token = await getData("token");
    this.mounted && this.setState({ token });
  };
  componentDidUpdate = async (prevProps, prevState) => {
    const { loggedIn, token } = this.state;
    if (loggedIn && (!token || token !== prevState.token)) {
      const token = await getData("token");
      this.mounted && this.setState({ token });
    }
    if (!loggedIn && prevState.loggedIn) {
      const token = await getData("token");
      this.mounted && this.setState({ token });
    }
  };
  updateLoggedIn = (loggedIn) => {
    this.mounted && this.setState({ loggedIn });
  };
  render() {
    const { token } = this.state;
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
          <Dashboard
            updateLoggedIn={this.updateLoggedIn.bind(this)}
          ></Dashboard>
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
  changeSignup,
  changeLogin,
})(Root);
