import React from "react";
import { AppRegistry, Platform, NativeModules } from "react-native";
import Root from "./Root";
import { Provider } from "react-redux";
import store from "./redux/index";

export default function App() {
  // if (Platform.OS === "ios") {
  //   AudioEngine.sampleMethod("String Arg", 1, (string) => {
  //     console.log(string);
  //   });
  // }
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
