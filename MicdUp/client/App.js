import React from "react";
import { AppRegistry, Platform } from "react-native";
import Root from "./Root";
import { Provider } from "react-redux";
import store from "./redux/index";

export default function App() {
  return (
    <Provider store={store}>
      <Root />
    </Provider>
  );
}
AppRegistry.registerComponent("main", () => App);
if (Platform.OS === "web") {
  const rootTag =
    document.getElementById("root") || document.getElementById("main");
  AppRegistry.runApplication("main", { rootTag });
}
