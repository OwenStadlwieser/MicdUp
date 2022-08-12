import React, { Component } from "react";
import { connect, useStore, useDispatch } from "react-redux";
import { View, RefreshControl, StyleSheet } from "react-native";
import Notification from "./Notification";

import { styles } from "../../../styles/Styles";
import { hideNotif } from "../../../redux/actions/display";
import { SwipeListView } from "react-native-swipe-list-view";
import { getUserNotifs, markNotifsAsSeen } from "../../../redux/actions/notifs";
export class NotificationView extends Component {
  constructor() {
    super();
    this.state = {
      loading: true,
      notif_data: [],
      refreshing: false,
      prevLength: 0,
    };

    this.mounted = true;
  }

  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = () => {
    this.props.markNotifsAsSeen();
  };

  render() {
    const { notifs } = this.props;
    const { refreshing } = this.state;
    return (
      <View
        style={[
          styles.paneUncentered,
          {
            position: "relative",
          },
        ]}
      >
        <SwipeListView
          data={notifs}
          disableRightSwipe
          disableLeftSwipe
          useNativeDriver={false}
          scrollEnabled={true}
          nestedScrollEnabled={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              tintColor="white"
              onRefresh={async () => {
                this.mounted && this.setState({ refreshing: true });
                await this.props.getUserNotifs(0);
                this.mounted && this.setState({ refreshing: false });
              }}
            />
          }
          onEndReached={async () => {
            const { refreshing, prevLength } = this.state;
            if (
              !refreshing &&
              prevLength != notifs.length &&
              Math.round(notifs.length / 20) > 0
            ) {
              this.mounted &&
                this.setState({ refreshing: true, prevLength: notifs.length });
              await this.props.getUserNotifs(Math.round(notifs.length / 20));
              this.mounted && this.setState({ refreshing: false });
            }
          }}
          renderItem={(data, rowMap) => <Notification data={data.item} />}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  notifs: state.notifs.notifs,
});

export default connect(mapStateToProps, {
  markNotifsAsSeen,
  hideNotif,
  getUserNotifs,
})(NotificationView);
