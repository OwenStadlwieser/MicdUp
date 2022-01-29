import React, { Component } from "react";
import { connect } from "react-redux";
import { View, StyleSheet, TouchableOpacity } from "react-native";
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
        Text,
        Image,
        Clickable,
        navigate,
      } = this.props;

    if (Clickable){
        return (
        <View style={styles.notif}>
            <TouchableOpacity onPress={() => navigate()}>
                <Text style={styles.text}>{Text}</Text>
            </TouchableOpacity>
        </View>);   
    }
    return (<View style={styles.notif}>
        <Text style={styles.text}>{Text}</Text>
    </View>);
  }
}

const styles = StyleSheet.create({
    notif: {
        backGroundColor: '#6b5b95'
    },
    text : {
      fontSize: 20,
      color: 'white'
    }

})
const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, {})(Notification);
