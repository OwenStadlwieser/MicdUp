import React, { Component } from "react";
import { connect } from "react-redux";
import { View, TextInput, Text, TouchableOpacity } from "react-native";
import { changeLogin } from "../../redux/actions/display";
import { styles } from "../../styles/Styles";
import { AntDesign } from "@expo/vector-icons";
import { login } from "../../redux/actions/auth";

export class Login extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      authenticator: "",
      password: "",
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

  render() {
    const { authenticator, password } = this.state;
    return (
      <View style={styles.container}>
        <AntDesign
          style={styles.backArrow}
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
          <Text style={styles.underline}>Forgot Password</Text>
        </View>
        <TouchableOpacity
          onPress={async () => await this.login()}
          style={styles.button}
          accessibilityLabel="Login"
        >
          <Text style={styles.text}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, { changeLogin, login })(Login);
