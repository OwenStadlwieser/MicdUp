import React, { Component } from "react";
import { connect } from "react-redux";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
} from "react-native";
import { styles } from "../../styles/Styles";
import { AntDesign } from "@expo/vector-icons";
// redux
import { changeLogin } from "../../redux/actions/display";
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
    this.mounted = false;
  };

  componentDidMount = () => {};

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
          <KeyboardAvoidingView style={styles.container}>
            <AntDesign
              style={styles.topLeftIcon}
              name="leftcircle"
              size={24}
              color="white"
              onPress={() => {
                this.props.changeLogin(false);
              }}
            />
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
            <TouchableOpacity
              onPress={async () => await this.login()}
              style={styles.button}
              accessibilityLabel="Login"
            >
              <Text style={styles.text}>Login</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        ));
    return login;
  }
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, { changeLogin, login })(Login);
