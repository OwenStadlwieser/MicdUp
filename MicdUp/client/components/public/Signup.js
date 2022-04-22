import React, { Component } from "react";
import { connect } from "react-redux";
// redux
import {
  changeSignup,
  showMessage,
  showHeader,
} from "../../redux/actions/display";
import { register } from "../../redux/actions/auth";
// styles
import { styles } from "../../styles/Styles";
//helpers
import {
  validateUsername,
  validateEmail,
  validatePassword,
  validatePhoneNumber,
  validateAge,
} from "../../reuseableFunctions/regex";
import {
  Platform,
  Dimensions,
  TextInput,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
} from "react-native";
import { Button } from "react-native-paper";
import { AntDesign } from "@expo/vector-icons";
import DatePicker from "react-native-datepicker";

const { height } = Dimensions.get("window");
export class Signup extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      email: "",
      phone: "",
      password: "",
      date: "",
      user: "",
    };

    this.mounted = true;
  }

  componentWillUnmount = () => {
    this.props.showHeader(true);
    this.mounted = false;
  };

  onChange = (name, text) => {
    this.mounted && this.setState({ [name]: text });
  };

  componentDidMount = () => {
    this.props.showHeader(false);
  };

  async signup() {
    const { email, phone, password, user, date } = this.state;
    const res = await this.props.register(email, phone, password, user, date);
    this.props.showMessage(res.data.createUser);
    if (res.data.createUser.success)
      setTimeout(() => {
        this.props.changeSignup(false);
      }, 3000);
  }

  render() {
    const { email, phone, password, date, user } = this.state;
    return (
      <KeyboardAvoidingView style={styles.container}>
        <AntDesign
          style={styles.backArrow}
          name="leftcircle"
          size={24}
          color="white"
          onPress={() => {
            this.props.changeSignup(false);
          }}
        />
        <TextInput
          value={user}
          style={
            validateUsername(user) && user
              ? styles.textInput
              : styles.invalidTextInput
          }
          placeholder="Username"
          onChangeText={(text) => this.onChange("user", text)}
        />
        <TextInput
          value={email}
          style={
            validateEmail(email) && email
              ? styles.textInput
              : styles.invalidTextInput
          }
          autoComplete="email"
          placeholder="Email"
          onChangeText={(text) => this.onChange("email", text)}
        />
        <TextInput
          value={phone}
          style={
            validatePhoneNumber(phone) && phone
              ? styles.textInput
              : styles.invalidTextInput
          }
          autoComplete="phone"
          placeholder="Phone Number"
          onChangeText={(text) => this.onChange("phone", text)}
        />
        <TextInput
          autoComplete="password"
          value={password}
          style={
            validatePassword(password) && password
              ? styles.textInput
              : styles.invalidTextInput
          }
          secureTextEntry={true}
          placeholder="Password"
          onChangeText={(text) => this.onChange("password", text)}
        />

        {Platform.OS === "web" ? (
          <input
            type="date"
            onChange={(event) => {
              this.mounted &&
                this.setState({ date: event.nativeEvent.target.value });
            }}
            placeholder="Date of Birth"
            format="DD/MM/YYYY"
            style={{
              width: "60%",
              height: 40,
              borderRadius: "5px",
              marginTop: 0.05 * height,
              position: "relative",
            }}
          />
        ) : (
          <DatePicker
            style={styles.datePickerStyle}
            date={date}
            mode="date"
            placeholder="Date of Birth"
            format="ddd, MMM DD YYYY HH:mm:ss Z"
            confirmBtnText="Confirm"
            cancelBtnText="Cancel"
            customStyles={{
              dateIcon: {
                position: "absolute",
                right: -5,
                top: 4,
                marginLeft: 0,
              },
              dateInput: {
                borderColor: "gray",
                alignItems: "flex-start",
                borderWidth: 0,
                borderBottomWidth: 1,
              },
              placeholderText: {
                fontSize: 17,
                color: "white",
              },
              dateText: {
                fontSize: 17,
                color: "white",
              },
            }}
            onDateChange={(date) => {
              this.mounted && this.setState({ date });
              if (!validateAge(date)) {
                this.props.showMessage({
                  success: false,
                  message: "Must be 13 or older to create account.",
                });
              }
            }}
          />
        )}

        <Button style={styles.button} onPress={async () => await this.signup()}>
          Signup
        </Button>
      </KeyboardAvoidingView>
    );
  }
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, {
  changeSignup,
  register,
  showMessage,
  showHeader,
})(Signup);
