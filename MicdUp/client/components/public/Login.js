import React, { Component } from "react";
import { connect } from "react-redux";
import { View, TextInput, Text, KeyboardAvoidingView } from "react-native";
import { styles } from "../../styles/Styles";
import { Button } from "react-native-paper";
import { Header } from "@react-navigation/stack";
// redux
import { showHeader } from "../../redux/actions/display";
import { login } from "../../redux/actions/auth";
// components
import ForgotPassword from "./ForgotPassword";

export class Login extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      authenticator: "",
      password: "",
      resetPassword: false,
    };

    this.mounted = true;
  }

  componentWillUnmount = () => {
    this.props.showHeader(true);
    this.mounted = false;
  };

  componentDidMount = () => {
    this.props.showHeader(false);
  };

  login = async () => {
    const { authenticator, password } = this.state;
    await this.props.login(authenticator, password);
  };

  onChange = (name, text) => {
    this.mounted && this.setState({ [name]: text });
  };

  hideResetPassword = () => {
    this.mounted && this.setState({ resetPassword: false });
  };
  render() {
    const { authenticator, password, resetPassword } = this.state;
    let login;
    resetPassword
      ? (login = (
          <ForgotPassword
            hideResetPassword={this.hideResetPassword.bind(this)}
          />
        ))
      : (login = (
          <KeyboardAvoidingView
            keyboardVerticalOffset={(Header.HEIGHT ? Header.HEIGHT : 0) + 20} // adjust the value here if you need more padding
            style={styles.avoidingView}
            behavior="padding"
          >
            <TextInput
              style={styles.textInput}
              value={authenticator}
              placeholder="Email or Phone Number"
              onChangeText={(text) => this.onChange("authenticator", text)}
            />
            <View style={styles.forgotPassword}>
              <TextInput
                secureTextEntry={true}
                value={password}
                style={styles.forgotPassButton}
                placeholder="Password"
                onChangeText={(text) => this.onChange("password", text)}
              />
              <Text
                onPress={() => {
                  this.mounted && this.setState({ resetPassword: true });
                }}
                style={styles.underline}
              >
                Forgot Password
              </Text>
            </View>
            <Button
              style={styles.button}
              onPress={async () => await this.login()}
            >
              Login
            </Button>
          </KeyboardAvoidingView>
        ));
    return login;
  }
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, { login, showHeader })(Login);
