import React, { Component } from "react";
import { connect } from "react-redux";
import { View, ScrollView, TouchableOpacity, Image } from "react-native";
// helpers
import { io } from "socket.io-client";
// redux
import { viewChats, viewMoreChats } from "../../../redux/actions/chat";
// styles
import { styles } from "../../../styles/Styles";
// chat
import Chat from "./Chat";

export class Dms extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      chatMessage: "",
      chatMessages: [],
    };
    this.socket = {};
    this.mounted = true;
  }

  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = async () => {
    await this.props.viewChats(0);
  };

  render() {
    const { chats, showingChat } = this.props;
    return (
      <ScrollView style={styles.pane}>
        {chats &&
          chats.length > 0 &&
          chats.map((chat, index) => (
            <TouchableOpacity
              key={index}
              onPress={async () => {
                await this.props.viewMoreChats(chat.id, 0);
                this.mounted && this.setState({ showingChat: true });
              }}
              style={styles.listItemContainerUser}
            >
              {chat &&
                chat.members.length > 0 &&
                chat.members.map((member, index) => (
                  <View style={styles.messageMember}>
                    <Image
                      source={
                        member && member.image
                          ? member.image.signedUrl
                          : require("../../../assets/no-profile-pic-icon-27.jpg")
                      }
                      style={styles.profileImgSmall}
                    />
                    <Text style={styles.listItemTextUser}>
                      {member.user.userName}
                    </Text>
                  </View>
                ))}
            </TouchableOpacity>
          ))}
      </ScrollView>
    );
  }
}

const mapStateToProps = (state) => ({
  chats: state.chat.chats,
  showingChat: state.chat.showingChat,
  activeChats: state.chat.activeChats,
  activeChatId: state.chat.activeChatId,
});

export default connect(mapStateToProps, { viewChats, viewMoreChats })(Dms);
