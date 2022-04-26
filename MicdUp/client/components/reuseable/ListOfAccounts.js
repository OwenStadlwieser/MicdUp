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
  getFollowersQuery,
  getFollowingQuery,
  getPrivatesQuery,
  updatePrivateCounts,
} from "../../redux/actions/profile";
import {
  viewProfile,
  showHeader,
  navigate,
  searchViewProfile,
} from "../../redux/actions/display";

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

  getData = async (skipMult) => {
    const { title } = this.props;
    const { id } = this.props.currentProfile;
    if (title === "Followers") {
      const res = await this.props.getFollowersQuery(id, skipMult);
      return res && res.followers ? res.followers : [];
    } else if (title === "Following") {
      const res = await this.props.getFollowingQuery(id, skipMult);
      return res && res.following ? res.following : [];
    } else if (title === "Privates") {
      const res = await this.props.getPrivatesQuery(skipMult);
      return res && res.privates ? res.privates : [];
    }
  };
  componentDidMount = async () => {
    this.props.showHeader(false);
    this.mounted && this.setState({ loading: true });
    const res = await this.getData(0);
    this.mounted && this.setState({ loading: false, data: res });
  };

  async handleScroll(event) {
    const { loading, prevLength, data } = this.state;
    try {
      if (
        event.nativeEvent.contentOffset.y >
          data.length * listItemHeight2X - height &&
        !loading &&
        prevLength !== data.length
      ) {
        this.mounted &&
          this.setState({ loading: true, prevLength: data.length });
        const res = await this.getData(Math.round(data.length / 20));
        this.mounted &&
          this.setState({ loading: false, data: [...data, ...res] });
      }
    } catch (err) {
      console.log(err);
    }
  }
  render() {
    const { data } = this.state;
    const { currentProfile, profile } = this.props;
    const { id } = this.props.currentProfile;
    const isUserProfile = profile && currentProfile ? profile.id === id : true;
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
        <SwipeListView
          data={data.filter((el) => el)}
          disableRightSwipe
          disableLeftSwipe={false}
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
                  if (profile && profile.id === data.item.id) {
                    this.props.navigate("Profile");
                    this.mounted && this.setState({ showing: false });
                    return;
                  }
                  this.props.navigate("Search");
                  this.props.viewProfile({ ...data.item });
                  this.props.searchViewProfile(true);
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
  title: state.display.list,
  user: state.auth.user,
  profile: state.auth.user.profile,
});

export default connect(mapStateToProps, {
  followProfile,
  updateFollowCounts,
  viewProfile,
  addToPrivates,
  updatePrivateCounts,
  showHeader,
  getFollowersQuery,
  getFollowingQuery,
  getPrivatesQuery,
  navigate,
  searchViewProfile,
})(ListOfAccounts);
