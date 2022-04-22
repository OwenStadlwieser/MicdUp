import React, { Component } from "react";
import { connect } from "react-redux";
import { View } from "react-native";
import { navigate } from "../../redux/actions/display";

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
          <StatusBar style="auto" />
        </View>
        <Navbar />
      </View>
    );
  }
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, { navigate })(LoginManager);
