import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { client } from "./apollo/client/index";
import { getUserQuery } from "./redux/actions/user";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import React, { Component } from "react";
import { connect, Provider } from "react-redux";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  resolvePath,
} from "react-router-dom";
import ReactDOM from "react-dom";
import store from "./redux/index";

export class Root extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      userId: "",
    };

    this.mounted = true;
  }
  componentDidMount = async () => {
    const res = await this.props.getUserQuery();
    console.log(resolvePath);
    this.mounted && this.setState({ userId: res.id });
  };
  render() {
    const { userId } = this.state;
    return (
      <View style={styles.container}>
        <Text>
          A userId in db is {userId}. Don't forget to fix getUser to change
          behavior
        </Text>
        <StatusBar style="auto" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
const mapStateToProps = (state) => ({});
export default connect(mapStateToProps, { getUserQuery })(Root);
