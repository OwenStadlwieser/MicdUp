import React, { Component } from "react";
import { connect,useStore,useDispatch } from "react-redux";
import { FlatList, View, ScrollView, StyleSheet, Text } from "react-native";
import Notification from "./Notification";

import { getData } from "../../../reuseableFunctions/helpers";
import { hideNotif } from "../../../redux/actions/display";
import store from "../../../redux";
import { Dispatch } from "redux";

export class NotificationView extends Component {
  constructor() {
    super();
    this.state = {
      loading: true,
      notif_data: [],
    };

    
    this.mounted = true;
  }


  componentWillUnmount = () => (this.mounted = false);


  componentDidMount = () => {
    this._getNotifs();
    store.subscribe(() => {

      if(store.getState().display.receiveNotif){
        console.log("NOTIFICATION RECEIVED");

        this.state.loading=true;
        this.forceUpdate();
        this._getNotifs();
        this.props.hideNotif();
      };

    })
  };

  _getNotifs = async() => {
    let notifs = await getData("notifications");
    console.log("GOT NOTIFS: ");
    console.log(notifs);
    //this.state.notif_data = notifs;
    this.state.notif_data = JSON.parse(notifs);
    this.state.loading = false;
    // console.log("STATE CHANGED");
    // console.log(this.notif_data);
    this.forceUpdate();
  }

 render() {
    


    if(this.state.loading){
      return (<View><Text>LOADING...</Text></View>)
    }

    return (
    <View>
            <ScrollView>
                {
                    this.state.notif_data.map((notif,index) => {
                        return (
                            <Notification text={notif.request.content.body} key={notif.identifier}/>
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

export default connect(mapStateToProps, {hideNotif})(NotificationView);
