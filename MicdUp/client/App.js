import React from "react";
import { StyleSheet } from "react-native";
import Root from "./Root";
import { Provider } from "react-redux";
import store from "./redux/index";
import { BrowserRouter } from "react-router-dom";
import "dotenv/config";

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Root />
      </BrowserRouter>
    </Provider>
  );
}
