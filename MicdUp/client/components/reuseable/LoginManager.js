import React, { Component } from "react";
import { connect } from "react-redux";
import { View, Text, Dimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Button } from "react-native-paper";
// redux
import { navigate } from "../../redux/actions/display";
// styles
import { styles } from "../../styles/Styles";
var { height, width } = Dimensions.get("window");

export class LoginManager extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
    };

    this.mounted = true;
  }

  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = () => {};

  render() {
    return (
      <View style={styles.containerPrivate}>
        <View style={styles.contentContainer}>
          <Button
            style={styles.button}
            onPress={() => {
              this.props.navigate("Login");
            }}
          >
            Login
          </Button>
          <Button
            style={styles.button}
            onPress={() => {
              this.props.navigate("Signup");
            }}
          >
            Sign Up
          </Button>
          <Text
            style={{
              fontStyle: "italic",
              color: "grey",
              width: width * 0.6,
              paddingTop: 20,
            }}
            onPress={() => {
              this.props.navigate("VerifyEmail");
            }}
          >
            Verify Email
          </Text>
          <StatusBar style="auto" />
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, { navigate })(LoginManager);
