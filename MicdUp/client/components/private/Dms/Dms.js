import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Text,
  Dimensions,
  TouchableWithoutFeedback,
  RefreshControl,
} from "react-native";
import { Button } from "react-native-paper";
// helpers
import { io } from "socket.io-client";
// redux
import {
  addLoading,
  removeLoading,
  navigate,
} from "../../../redux/actions/display";
import {
  viewChats,
  viewMoreChats,
  createOrOpenChat,
} from "../../../redux/actions/chat";
import { searchUsers } from "../../../redux/actions/user";
// components
import DropDown from "../../reuseable/DropDown";
import SearchComponent from "../../reuseable/SearchComponent";
import DeleteableItem from "../../reuseable/DeleteableItem";
// styles
import { styles } from "../../../styles/Styles";
// chat
import Chat from "./Chat";
const { height, width } = Dimensions.get("window");
export class Dms extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      chatMessage: "",
      chatMessages: [],
      users: [],
      userNames: [],
      showDropDown: false,
    };
    this.mounted = true;
  }

  setUsersState = (users) => {
    this.mounted && this.setState({ users });
  };

  setSearchTerm = (term) => {
    this.mounted && this.setState({ term });
  };

  componentWillUnmount = () => {
    this.props.removeLoading("DMS");
    this.mounted = false;
  };

  componentDidMount = async () => {
    this.props.addLoading("DMS");
    await this.props.viewChats(0);
    this.props.removeLoading("DMS");
  };

  render() {
    const { chats, profile } = this.props;
    const { users, userNames, showDropDown, refreshing } = this.state;
    const app = (
      <TouchableOpacity
        onPress={() => {
          this.mounted && this.setState({ showDropDown: false });
        }}
        delayPressIn={1000}
        style={[styles.paneUncentered, { alignItems: "center" }]}
      >
        <View style={{ paddingBottom: 20 }}>
          <SearchComponent
            parentViewStyle={{ zIndex: 2 }}
            searchInputContainerStyle={styles.searchInputContainerStyleUsers}
            inputStyle={styles.textInputRecEdit}
            isForUser={true}
            placeholder={"Find Friends"}
            setStateOnChange={true}
            setStateOnChangeFunc={this.setSearchTerm.bind(this)}
            setResOnChange={true}
            setResOnChangeFunc={this.setUsersState.bind(this)}
            searchFunction={this.props.searchUsers}
            splitSearchTerm={true}
            placeHolderColor={"white"}
            scrollable={true}
            onFocus={() =>
              this.mounted && this.setState({ showDropDown: true })
            }
            displayResults={false}
            initValue={users ? users.toString() : ""}
          />
          {showDropDown && (
            <DropDown
              containerStyle={{
                zIndex: 2,
                borderRadius: 8,
              }}
              parentStyle={{
                zIndex: 2,
                height: height * 0.3,
              }}
              results={
                users &&
                users.map((user) => {
                  user.image = user.profile.image
                    ? user.profile.image.signedUrl
                    : false;
                  return user;
                })
              }
              image={true}
              title={"userName"}
              onBlur={() => {
                this.mounted && this.setState({ showDropDown: false });
              }}
              onPressFunc={(res) => {
                const { userNames } = this.state;
                if (
                  userNames.findIndex((user) => {
                    return user.userName === res.userName;
                  }) > -1
                ) {
                  return;
                }
                userNames.push(res);
                this.mounted && this.setState({ userNames });
              }}
            />
          )}
        </View>
        {userNames && userNames.length > 0 && (
          <View style={styles.deleteItemContainer}>
            {userNames.map((user, index) => (
              <DeleteableItem
                item={user}
                style={{ margin: 3 }}
                color={"white"}
                title={"userName"}
                key={index}
                onDelete={() => {
                  let currentNames = [...this.state.userNames];
                  const index = currentNames.findIndex((user2) => {
                    return user.userName === user2.userName;
                  });
                  currentNames.splice(index, 1);
                  this.mounted && this.setState({ userNames: currentNames });
                }}
              />
            ))}
            {userNames && userNames.length > 0 && (
              <Button
                style={{ margin: 3 }}
                color="#6FF6FF"
                icon="creation"
                mode="contained"
                onPress={async () => {
                  this.props.addLoading("DMS");
                  await this.props.createOrOpenChat(
                    [...userNames.map((user) => user.profile.id), profile.id],
                    profile.id
                  );
                  this.props.removeLoading("DMS");
                }}
              >
                Create Chat
              </Button>
            )}
          </View>
        )}
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                this.mounted && this.setState({ refreshing: true });
                await this.props.viewChats(0);
                this.mounted && this.setState({ refreshing: false });
              }}
            />
          }
          style={{ zIndex: 1 }}
        >
          {chats &&
            chats.length > 0 &&
            chats.map((chat, index) => (
              <TouchableOpacity
                key={index}
                onPress={async () => {
                  this.props.addLoading("DMS");
                  await this.props.viewMoreChats(chat, 0);
                  this.props.navigate("Chat");
                  this.mounted && this.setState({ showingChat: true });
                  this.props.removeLoading("DMS");
                }}
                style={styles.listItemContainerChat}
              >
                {chat &&
                  chat.members &&
                  chat.members.length > 0 &&
                  chat.members
                    .filter((member) => member)
                    .map(
                      (member, index) =>
                        member &&
                        member.user && (
                          <View key={index} style={styles.messageMember}>
                            <Image
                              source={
                                member && member.image
                                  ? { uri: member.image.signedUrl }
                                  : require("../../../assets/no-profile-pic-icon-27.jpg")
                              }
                              style={styles.commentImg}
                            />
                            <Text style={styles.listItemTextUser}>
                              {member.user.userName}
                            </Text>
                          </View>
                        )
                    )}
              </TouchableOpacity>
            ))}
        </ScrollView>
      </TouchableOpacity>
    );
    return app;
  }
}

const mapStateToProps = (state) => ({
  chats: state.chat.chats,
  showingChat: state.chat.showingChat,
  activeChats: state.chat.activeChats,
  socket: state.auth.socket,
  profile: state.auth.user.profile,
});

export default connect(mapStateToProps, {
  viewChats,
  viewMoreChats,
  searchUsers,
  createOrOpenChat,
  addLoading,
  removeLoading,
  navigate,
})(Dms);
