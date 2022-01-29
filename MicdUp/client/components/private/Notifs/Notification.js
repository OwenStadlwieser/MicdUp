import React, { Component } from "react";
import { connect } from "react-redux";
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from "react-native";
import { navigate } from "../../../redux/actions/display";

const {width, height} = Dimensions.get("window");

export class Notification extends Component {
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
    const {
        text,
        image,
        user,
        clickable,
        navigateTo,
        navigate,
      } = this.props;

    if (clickable){
        return (
        <View style={styles.notif}>
            <TouchableOpacity onPress={() => navigate(navigateTo)}>
                <Text style={styles.text}>{text}</Text>
            </TouchableOpacity>
        </View>);   
    }
    return (<View style={styles.notif}>
        <Text style={styles.text}>{text}</Text>
    </View>);
  }
}

const styles = StyleSheet.create({
    notif: {
        backgroundColor: 'white',
        height: 50,
        width: width * 0.9,
        justifyContent: 'center',
        maginTop: 10,
        marginBottom: 10,
        borderRadius: 10
    },
    text : {
      fontSize: 20,
      color: 'black'
    }

})

const mapStateToProps = (state) => ({
  mountedComponent : state.display.mountedComponent
});

export default connect(mapStateToProps, {navigate})(Notification);
