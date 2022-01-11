import React, { Component } from "react";
import { connect } from "react-redux";
import { View, TextInput, TouchableOpacity, Text } from "react-native";
import { styles } from "../../styles/Styles";
import { AntDesign } from "@expo/vector-icons";
import {
  forgotPass,
  forgotPassVerify,
  forgotPassChange,
} from "../../redux/actions/auth";
import { showMessage } from "../../redux/actions/display";
export class ForgotPassword extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      email: "",
      stage: 1,
      secureCode: "",
      newPass: "",
    };

    this.mounted = true;
  }

  onChange = (name, text) => {
    this.mounted && this.setState({ [name]: text });
  };

  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = () => {};

  changePassword = async () => {
    const { newPass, secureCode, email } = this.state;
    if (!newPass) {
      this.props.showMessage({
        success: false,
        message: "Please enter new password",
      });
      return;
    }
    const res = await this.props.forgotPassChange(secureCode, newPass, email);
    if (
      res.data &&
      res.data.forgotPassChange &&
      res.data.forgotPassChange.success
    ) {
      this.props.showMessage({
        success: true,
        message: "Password updated",
      });
      setTimeout(() => {
        this.props.hideResetPassword();
      }, 3000);
    }
  };

  render() {
    const { email, stage, secureCode, newPass } = this.state;
    return (
      <View style={styles.container}>
        <AntDesign
          style={styles.backArrow}
          name="leftcircle"
          size={24}
          color="white"
          onPress={() => {
            this.props.hideResetPassword();
          }}
        />
        {stage === 1 ? (
          <View>
            <TextInput
              style={styles.textInput}
              value={email}
              placeholder="Email"
              onChangeText={(text) => this.onChange("email", text)}
            />
            <TouchableOpacity
              style={styles.button}
              accessibilityLabel="Reset Password"
              onPress={async () => {
                const { email } = this.state;
                if (!email) {
                  this.props.showMessage({
                    success: false,
                    message: "Please enter email",
                  });
                  return;
                }
                const res = await this.props.forgotPass(email);
                if (
                  res.data &&
                  res.data.forgotPass &&
                  res.data.forgotPass.success
                )
                  this.mounted && this.setState({ stage: 2 });
              }}
            >
              <Text style={styles.text}>Request Link</Text>
            </TouchableOpacity>
          </View>
        ) : stage === 2 ? (
          <View>
            <TextInput
              style={styles.textInput}
              value={secureCode}
              placeholder="Secure Code"
              onChangeText={(text) => this.onChange("secureCode", text)}
            />
            <TouchableOpacity
              style={styles.button}
              accessibilityLabel="Secure Code"
              onPress={async () => {
                const { secureCode } = this.state;
                if (!secureCode) {
                  this.props.showMessage({
                    success: false,
                    message: "Please enter secure code",
                  });
                  return;
                }
                const res = await this.props.forgotPassVerify(
                  secureCode,
                  email
                );
                if (
                  res.data &&
                  res.data.forgotPassVerify &&
                  res.data.forgotPassVerify.success
                )
                  this.mounted && this.setState({ stage: 3 });
              }}
            >
              <Text style={styles.text}>Verify Code</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <TextInput
              style={styles.textInput}
              value={newPass}
              placeholder="New Password"
              secureTextEntry={true}
              onChangeText={(text) => this.onChange("newPass", text)}
            />
            <TouchableOpacity
              style={styles.button}
              accessibilityLabel="New Password"
              onPress={async () => {
                await this.changePassword();
              }}
            >
              <Text style={styles.text}>Change Password</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, {
  forgotPass,
  showMessage,
  forgotPassChange,
  forgotPassVerify,
})(ForgotPassword);
