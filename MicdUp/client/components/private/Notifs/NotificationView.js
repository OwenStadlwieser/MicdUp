import React, { Component } from "react";
import { connect } from "react-redux";
import { FlatList, View, ScrollView, StyleSheet } from "react-native";
import Notification from "./Notification";
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

  render() {
    


    const notifications = [{id:1,text: "notification!",clickable: true, user:"andrew"},{id:2,text: "notification2!",clickable: true, user:"andrew"},{id:3,text: "notification3!",clickable: true, user:"andrew"},{id:4,text: "notification4!",clickable: true, user:"andrew"}];


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
