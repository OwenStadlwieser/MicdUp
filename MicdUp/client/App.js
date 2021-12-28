import React from "react";
import { StyleSheet } from "react-native";
import Root from "./Root";
import { Provider } from "react-redux";
import store from "./redux/index";
import { BrowserRouter } from "react-router-dom";
import "dotenv/config";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default function App() {
  console.log("app exec");
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Root />
      </BrowserRouter>
    </Provider>
  );
}
