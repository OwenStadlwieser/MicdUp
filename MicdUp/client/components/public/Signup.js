import React, { Component } from "react";
import { connect } from "react-redux";
import { changeSignup, showMessage } from "../../redux/actions/display";
import { register } from "../../redux/actions/auth";
import { styles } from "../../styles/dashboardStyles";
import {
  Platform,
  View,
  TextInput,
  Text,
  TouchableOpacity,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import DatePicker from "react-native-datepicker";

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

  componentWillUnmount = () => (this.mounted = false);

  onChange = (name, text) => {
    this.mounted && this.setState({ [name]: text });
  };

  componentDidMount = () => {};

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
      <View style={styles.container}>
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
          style={styles.textInput}
          placeholder="Username"
          onChangeText={(text) => this.onChange("user", text)}
        />
        <TextInput
          style={styles.textInput}
          value={email}
          autoComplete="email"
          placeholder="Email"
          onChangeText={(text) => this.onChange("email", text)}
        />
        <TextInput
          style={styles.textInput}
          value={phone}
          autoComplete="phone"
          placeholder="Phone Number"
          onChangeText={(text) => this.onChange("phone", text)}
        />
        <TextInput
          autoComplete="password"
          value={password}
          style={styles.textInput}
          secureTextEntry={true}
          placeholder="Password"
          onChangeText={(text) => this.onChange("password", text)}
        />
        {Platform.OS === "web" ? (
          <input
            type="date"
            onChange={(event) => {
              console.log(event);
              this.mounted &&
                this.setState({ date: event.nativeEvent.target.value });
            }}
            placeholder="Date of Birth"
            format="DD/MM/YYYY"
            style={{
              width: "60%",
              height: 40,
              borderRadius: "5px",
              marginTop: "5vh",
              position: "relative",
            }}
          />
        ) : (
          <DatePicker
            style={styles.datePickerStyle}
            date={date}
            mode="date"
            placeholder="Date of Birth"
            format="DD/MM/YYYY"
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
            }}
          />
        )}

        <TouchableOpacity
          onPress={async () => {
            await this.signup();
          }}
          style={styles.button}
          accessibilityLabel="Signup"
        >
          <Text style={styles.text}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, {
  changeSignup,
  register,
  showMessage,
})(Signup);
