import React, { Component } from "react";
import { connect } from "react-redux";
import { FlatList, View, ScrollView, StyleSheet } from "react-native";
import Notification from "./Notification";

import { getData } from "../../../reuseableFunctions/helpers";



export class NotificationView extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
    };

    this.mounted = true;
  }

  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = () => {};

  async render() {
    

    /*
    Notification content:
    {
          id:id
          content:content,
          image:image,
          navTo:navTo
    }
    */
    let notifs = await getData("notifications");

    if(!notifs){
      return (<View/>);
    }
    return (
    <View>
            <ScrollView>
                {
                    notifications.map((notification,index) => {
                        return (
                            <Notification text={notification.text} key={notification.id}/>
                        )
                    } )
                }
            </ScrollView>
    </View>);
  }
}

const styles = StyleSheet.create({
    notifList: {
        justifyContent:'space-between'
    },
})

const mapStateToProps = (state) => ({

});

export default connect(mapStateToProps, {})(NotificationView);
