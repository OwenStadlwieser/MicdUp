import React, { Component } from "react";
import { connect } from "react-redux";
import { View, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width,height} = Dimensions.get("window");

export class NotificationBell extends Component {
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
    return (<View style={styles.bell}> 
        <TouchableOpacity style={styles.btn}>
            <MaterialCommunityIcons name="bell" size={24} color="white" />
        </TouchableOpacity>
        </View>);
  }
}

const styles = StyleSheet.create({
    bell : {
        justifyContent: 'flex-end',
        backgroundColor: 'transparent',
        position: 'absolute',
        top: 22,
        zIndex: 10,
        height: 20,
        width,
        flexDirection : 'row',
    

        
    },
    btn : {
        position: "absolute",
        right: width * 0.08,
        top: height * 0.002,
    }
})

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, {})(NotificationBell);
