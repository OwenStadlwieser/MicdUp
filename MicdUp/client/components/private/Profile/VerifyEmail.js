import React, { Component } from "react";
import { connect } from "react-redux";
import { View, TextInput, TouchableOpacity, Text } from "react-native";
import { styles } from "../../../styles/Styles";
import { AntDesign } from "@expo/vector-icons";
import { verifyEmail, setEmailVerified } from "../../../redux/actions/user";
import { showMessage, navigate } from "../../../redux/actions/display";
import { Button } from "react-native-paper";

export class VerifyEmail extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      email: "",
      stage: 1,
      verificationCode: "",
    };
    this.mounted = true;
  }

  onChange = (name, text) => {
    this.mounted && this.setState({ [name]: text });
  };

  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = () => {};

  makeEmailVerified = async () => {
    const { verificationCode, email } = this.state;
    const res = await this.props.setEmailVerified(verificationCode, email);
    if (
      res.data &&
      res.data.setEmailVerified &&
      res.data.setEmailVerified.success
    ) {
      this.props.showMessage({
        success: true,
        message: "Email Verified.",
      });
      setTimeout(() => {
        this.props.navigate("Login");
      }, 3000);
    }
  };

  render() {
    const { email, stage, verificationCode } = this.state;
    return (
      <View style={styles.container}>
        {stage === 1 ? (
          <View>
            <TextInput
              style={styles.textInput}
              value={email}
              placeholder="Email"
              onChangeText={(text) => this.onChange("email", text)}
            />
            <Button
              style={styles.button}
              accessibilityLabel="Verify Email"
              onPress={async () => {
                const { email } = this.state;
                if (!email) {
                  this.props.showMessage({
                    success: false,
                    message: "Please enter email.",
                  });
                  return;
                }
                const res = await this.props.verifyEmail(email);
                if (
                  res.data &&
                  res.data.verifyEmail &&
                  res.data.verifyEmail.success
                )
                  this.mounted && this.setState({ stage: 2 });
              }}
            >
              <Text style={styles.text}>Verify Email</Text>
            </Button>
          </View>
        ) : (
          <View>
            <TextInput
              style={styles.textInput}
              value={verificationCode}
              placeholder="Verification Code"
              onChangeText={(text) => this.onChange("verificationCode", text)}
            />
            <Button
              style={styles.button}
              accessibilityLabel="Verification Code"
              onPress={async () => {
                const { verificationCode } = this.state;
                if (!verificationCode) {
                  this.props.showMessage({
                    success: false,
                    message: "Please enter verification code",
                  });
                  return;
                }
                await this.makeEmailVerified();
              }}
            >
              <Text style={styles.text}>Verify Code</Text>
            </Button>
          </View>
        )}
      </View>
    );
  }
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, {
  verifyEmail,
  showMessage,
  setEmailVerified,
  navigate,
})(VerifyEmail);
