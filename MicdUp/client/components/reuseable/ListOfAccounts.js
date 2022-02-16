import React, { Component } from "react";
import { connect } from "react-redux";
import {
  View,
  TouchableOpacity,
  Image,
  Platform,
  Text,
  Dimensions,
} from "react-native";
import { Button } from "react-native-paper";
import { SwipeListView } from "react-native-swipe-list-view";
import { styles } from "../../styles/Styles";
import { Appbar } from "react-native-paper";
import { followProfile, updateFollowCounts } from "../../redux/actions/profile";

const { height, width } = Dimensions.get("window");
export class ListOfAccounts extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      data: [],
    };

    this.mounted = true;
  }

  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = async () => {
    const { getData } = this.props.params;
    this.mounted && this.setState({ loading: true });
    const res = await getData(0);
    this.mounted && this.setState({ loading: false, data: res });
  };

  render() {
    const { action1, action2, swipeable, swipeAction, handleScroll } =
      this.props.params;
    const { isUserProfile } = this.props;
    const { data } = this.state;
    return (
      <View
        style={{
          height,
          width,
          zIndex: 5,
          backgroundColor: "white",
        }}
      >
        <Appbar.Header
          style={{
            backgroundColor: "#1A3561",
            width,
            height: height * 0.1,
            zIndex: 2,
          }}
        >
          <Appbar.BackAction
            onPress={() => {
              this.props.hideList();
            }}
          />
          <Appbar.Content title={this.props.params.title} />
        </Appbar.Header>
        <SwipeListView
          data={data}
          disableRightSwipe
          disableLeftSwipe={!swipeable}
          onScroll={handleScroll}
          scrollEventThrottle={50}
          useNativeDriver={Platform.OS === "web" ? false : true}
          renderItem={(data, rowMap) => {
            return (
              <View
                key={data.index}
                style={[styles.listItemContainer, { width, borderRadius: 8 }]}
              >
                {data.item.image && (
                  <Image
                    source={
                      data.item.image.signedUrl
                        ? {
                            uri: data.item.image.signedUrl,
                          }
                        : require("../../assets/no-profile-pic-icon-27.jpg")
                    }
                    style={styles.listItemProfileImg}
                  />
                )}
                <Text style={[styles.listItemText, { flex: 7 }]}>
                  {data.item.user.userName}
                </Text>
                <View style={{}}>
                  {isUserProfile && (
                    <Text
                      onPress={async () => {
                        const { currentProfile } = this.props;
                        const res = await this.props.followProfile(
                          data.item.id,
                          false
                        );
                        if (res.id) {
                          const { data } = this.state;
                          const index = data.findIndex((item) => {
                            return item.id === res.id;
                          });
                          data[index].isFollowedByUser =
                            !data[index].isFollowedByUser;
                          this.mounted && this.setState({ data: [...data] });
                          currentProfile &&
                            this.props.updateFollowCounts(
                              currentProfile.followingCount +
                                (data[index].isFollowedByUser ? 1 : -1)
                            );
                        }
                      }}
                      style={styles.nextButtonText}
                    >
                      {data.item.isFollowedByUser ? "unfollow" : "follow"}
                    </Text>
                  )}
                  {action1 && (
                    <Button
                      icon={action1.icon}
                      color={action1.color}
                      mode="contained"
                      onPress={() => {
                        action1.onPress(data.item);
                      }}
                      style={action1.style}
                    ></Button>
                  )}
                  {action2 && (
                    <Button
                      icon={action2.icon}
                      color={action2.color}
                      mode="contained"
                      onPress={() => {
                        action2.onPress(data.item);
                      }}
                      style={action2.style}
                    ></Button>
                  )}
                </View>
              </View>
            );
          }}
          rightOpenValue={-75}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  currentProfile: state.display.viewingProfile,
});

export default connect(mapStateToProps, { followProfile, updateFollowCounts })(
  ListOfAccounts
);
