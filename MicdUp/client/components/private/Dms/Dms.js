import React, { Component } from "react";
import { connect } from "react-redux";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Text,
  Dimensions,
} from "react-native";
import { Button } from "react-native-paper";
// helpers
import { io } from "socket.io-client";
// redux
import { createOrOpenChat } from "../../../redux/actions/chat";
import { viewChats, viewMoreChats } from "../../../redux/actions/chat";
import { searchUsers } from "../../../redux/actions/user";
// components
import DropDown from "../../reuseable/DropDown";
import SearchComponent from "../../reuseable/SearchComponent";
import DeleteableItem from "../../reuseable/DeleteableItem";
// styles
import { styles } from "../../../styles/Styles";
// chat
import Chat from "./Chat";
const { height } = Dimensions.get("window");
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

  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = async () => {
    const { activeChatId, socket } = this.props;
    if (!activeChatId) await this.props.viewChats(0);
  };

  render() {
    const { chats, showingChat, activeChatId, profile } = this.props;
    const { users, userNames, showDropDown } = this.state;
    const app = activeChatId ? (
      <View style={styles.pane}>
        <Chat />
      </View>
    ) : (
      <View style={styles.pane}>
        <SearchComponent
          parentViewStyle={styles.parentViewStyleUsers}
          searchInputContainerStyle={styles.searchInputContainerStyleUsers}
          inputStyle={styles.inputStyleUsers}
          isForUser={true}
          placeholder={"Find Friends"}
          setStateOnChange={true}
          setStateOnChangeFunc={this.setSearchTerm.bind(this)}
          setResOnChange={true}
          setResOnChangeFunc={this.setUsersState.bind(this)}
          searchFunction={this.props.searchUsers}
          splitSearchTerm={true}
          inputStyle={styles.textInputRecEdit}
          placeHolderColor={"white"}
          scrollable={true}
          onFocus={() => this.mounted && this.setState({ showDropDown: true })}
          displayResults={false}
          initValue={users ? users.toString() : ""}
        />
        {showDropDown && (
          <DropDown
            containerStyle={{
              marginTop: height * 0.25,
              maxHeight: height * 0.4,
              minHeight: 0,
            }}
            results={users.map((user) => {
              user.image = user.profile.image
                ? user.profile.image.signedUrl
                : false;
              return user;
            })}
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
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            flexWrap: "wrap",
            alignItems: "flex-start",
            minHeight: 0,
            marginTop: showDropDown ? height * 0.4 : height * 0.2,
          }}
        >
          {userNames &&
            userNames.map((user, index) => (
              <DeleteableItem
                item={user}
                style={{ margin: 3 }}
                color={"white"}
                title={"userName"}
                key={index}
                onDelete={() => {
                  let currentNames = [...this.state.userNames];
                  const index = currentNames.findIndex((user) => {
                    return user.userName === user.userName;
                  });
                  currentNames = currentNames.splice(1, index);
                  this.mounted && this.setState({ userNames: currentNames });
                }}
              />
            ))}
          <View></View>
          {userNames && userNames.length > 0 && (
            <Button
              style={{ margin: 3 }}
              color="#6FF6FF"
              icon="creation"
              mode="contained"
              onPress={async () => {
                await this.props.createOrOpenChat(
                  [...userNames.map((user) => user.profile.id), profile.id],
                  profile.id
                );
              }}
            >
              Create Chat
            </Button>
          )}
        </View>
        <ScrollView
          style={{ marginTop: showDropDown ? height * 0.05 : height * 0.2 }}
        >
          {chats &&
            chats.length > 0 &&
            chats.map((chat, index) => (
              <TouchableOpacity
                key={index}
                onPress={async () => {
                  await this.props.viewMoreChats(chat, 0);
                  this.mounted && this.setState({ showingChat: true });
                }}
                style={styles.listItemContainerChat}
              >
                {chat &&
                  chat.members &&
                  chat.members.length > 0 &&
                  chat.members.map((member, index) => (
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
                  ))}
              </TouchableOpacity>
            ))}
        </ScrollView>
      </View>
    );
    return app;
  }
}

const mapStateToProps = (state) => ({
  chats: state.chat.chats,
  showingChat: state.chat.showingChat,
  activeChats: state.chat.activeChats,
  activeChatId: state.chat.activeChatId,
  socket: state.auth.socket,
  profile: state.auth.user.profile,
});

export default connect(mapStateToProps, {
  viewChats,
  viewMoreChats,
  searchUsers,
  createOrOpenChat,
})(Dms);
