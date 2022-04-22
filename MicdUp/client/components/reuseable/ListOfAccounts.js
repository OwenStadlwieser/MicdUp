import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import {
  View,
  TouchableOpacity,
  Image,
  Platform,
  Text,
  Dimensions,
  TouchableHighlight,
} from "react-native";
import { Button } from "react-native-paper";
import { SwipeListView } from "react-native-swipe-list-view";
import { styles, listItemHeight2X } from "../../styles/Styles";
import { Appbar } from "react-native-paper";
// redux
import {
  followProfile,
  updateFollowCounts,
  addToPrivates,
  updatePrivateCounts,
} from "../../redux/actions/profile";
import { viewProfile, showHeader } from "../../redux/actions/display";
// children
import Profile from "../private/Profile/Profile";
const { height, width } = Dimensions.get("window");
export class ListOfAccounts extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      data: [],
      prevLength: 0,
      viewingProfile: false,
    };

    this.mounted = true;
  }

  componentWillUnmount = () => {
    this.props.showHeader(true);
    this.mounted = false;
  };

  componentDidMount = async () => {
    const { getData } = this.props.params;
    this.props.showHeader(false);
    this.mounted && this.setState({ loading: true });
    const res = await getData(0);
    this.mounted && this.setState({ loading: false, data: res });
  };

  async handleScroll(event) {
    const { params } = this.props;
    const { loading, prevLength, data } = this.state;
    const { getData } = params;
    try {
      if (
        event.nativeEvent.contentOffset.y >
          data.length * listItemHeight2X - height &&
        !loading &&
        prevLength !== data.length
      ) {
        this.mounted &&
          this.setState({ loading: true, prevLength: data.length });
        const res = await getData(Math.round(data.length / 20));
        this.mounted &&
          this.setState({ loading: false, data: [...data, ...res] });
      }
    } catch (err) {
      console.log(err);
    }
  }
  render() {
    const { action1, action2, swipeable, swipeAction } = this.props.params;
    const { isUserProfile } = this.props;
    const { data, viewingProfile, userName, id } = this.state;
    if (viewingProfile)
      return (
        <View
          style={{
            height: height * 0.9,
            width,
            zIndex: 5,
            backgroundColor: "transparent",
            position: "absolute",
          }}
        >
          <Profile
            backArrow={true}
            backAction={(() => {
              this.mounted && this.setState({ viewingProfile: false });
            }).bind(this)}
            userName={userName}
            id={id}
          />
        </View>
      );
    return (
      <View
        style={{
          height: height * 0.9,
          width,
          zIndex: 6,
          backgroundColor: "white",
          position: "absolute",
        }}
      >
        <Appbar.Header
          style={[
            styles.appBarHeader,
            {
              backgroundColor: "#1A3561",
            },
          ]}
        >
          <Appbar.BackAction
            onPress={() => {
              this.props.hideList();
            }}
          />
          <Appbar.Content title={this.props.params.title} />
        </Appbar.Header>
        <SwipeListView
          data={data.filter((el) => el)}
          disableRightSwipe
          disableLeftSwipe={!swipeable}
          onScroll={this.handleScroll.bind(this)}
          scrollEventThrottle={50}
          useNativeDriver={Platform.OS === "web" ? false : true}
          renderItem={(data, rowMap) => {
            return (
              <TouchableHighlight
                key={data.index}
                style={[
                  styles.listItemContainer,
                  { width, borderRadius: 0, height: listItemHeight2X },
                ]}
                underlayColor="#6FF6FF"
                onPress={() => {
                  this.props.viewProfile(data.item);
                  this.mounted &&
                    this.setState({
                      viewingProfile: true,
                      userName: data.item.user.userName,
                      id: data.item.id,
                    });
                }}
              >
                <Fragment>
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
                  <Text
                    style={[styles.listItemText, { flex: 8, fontSize: 24 }]}
                  >
                    {data.item.user.userName}
                  </Text>
                  <View
                    style={{
                      alignItems: "flex-start",
                      flex: 7,
                      flexWrap: "wrap",
                    }}
                  >
                    {isUserProfile && (
                      <Button
                        color="white"
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
                        style={[
                          styles.nextButtonText,
                          {
                            backgroundColor: "#1A3561",
                            alignSelf: "stretch",
                          },
                        ]}
                      >
                        {data.item.isFollowedByUser ? "unfollow" : "follow"}
                      </Button>
                    )}
                    {isUserProfile && (
                      <Button
                        color="white"
                        onPress={async () => {
                          const { currentProfile } = this.props;
                          const res = await this.props.addToPrivates(
                            data.item.id,
                            data.item.isPrivateByUser,
                            false
                          );
                          if (res.id) {
                            const { data } = this.state;
                            const index = data.findIndex((item) => {
                              return item.id === res.id;
                            });
                            data[index].isPrivateByUser =
                              !data[index].isPrivateByUser;
                            this.mounted && this.setState({ data: [...data] });
                            currentProfile &&
                              this.props.updatePrivateCounts(
                                currentProfile.privatesCount +
                                  (data[index].isPrivateByUser ? 1 : -1)
                              );
                          }
                        }}
                        style={[
                          styles.nextButtonText,
                          {
                            backgroundColor: "#1A3561",
                            alignSelf: "stretch",
                            marginTop: 10,
                          },
                        ]}
                      >
                        {data.item.isPrivateByUser
                          ? "remove private"
                          : "add private"}
                      </Button>
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
                </Fragment>
              </TouchableHighlight>
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

export default connect(mapStateToProps, {
  followProfile,
  updateFollowCounts,
  viewProfile,
  addToPrivates,
  updatePrivateCounts,
  showHeader,
})(ListOfAccounts);
