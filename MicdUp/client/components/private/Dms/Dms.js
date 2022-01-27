import React, { Component } from "react";
import { connect } from "react-redux";
import { View, ScrollView, TouchableOpacity, Image, Text } from "react-native";
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
    this.mounted = true;
  }

  componentWillUnmount = () => (this.mounted = false);

  componentDidMount = async () => {
    const { activeChatId, socket } = this.props;
    if (!activeChatId) await this.props.viewChats(0);
  };

  render() {
    const { chats, showingChat, activeChatId } = this.props;
    const app = activeChatId ? (
      <View style={styles.pane}>
        <Chat />
      </View>
    ) : (
      <View style={styles.pane}>
        <ScrollView style={{}}>
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
                            ? member.image.signedUrl
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
});

export default connect(mapStateToProps, { viewChats, viewMoreChats })(Dms);
