import React from "react";
import { AppRegistry, Platform, NativeModules } from "react-native";
import Root from "./Root";
import { Provider } from "react-redux";
import store from "./redux/index";
import { rollbar } from "./reuseableFunctions/constants";
import { Provider as RollbarProvider } from "@rollbar/react";

export default function App() {
  // if (Platform.OS === "ios") {
  //   AudioEngine.sampleMethod("String Arg", 1, (string) => {
  //     console.log(string);
  //   });
  // }
  return (
    <RollbarProvider instance={rollbar}>
      <Provider store={store}>
        <Root />
      </Provider>
    </RollbarProvider>
  );
}
AppRegistry.registerComponent("main", () => App);
if (Platform.OS === "web") {
  const rootTag =
    document.getElementById("root") || document.getElementById("main");
  AppRegistry.runApplication("main", { rootTag });
}
