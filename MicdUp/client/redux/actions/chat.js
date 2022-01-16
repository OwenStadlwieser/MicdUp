import { SET_CHATS, ADD_CHAT, SET_ACTIVE_CHATS, ADD_CHATS } from "../types";
import {
  FETCH_CHAT_MUTATION,
  FETCH_CHATS_QUERY,
  FETCH_CHAT_MESSAGES_QUERY,
} from "../../apollo/private/chat";
import { showMessage } from "./display";
import { navigate } from "./display";
import { client } from "../../apollo/client/index";

export const createOrOpenChat = (members, creator) => async (dispatch) => {
  try {
    const res = await client.mutate({
      mutation: FETCH_CHAT_MUTATION,
      variables: { members, creator },
      fetchPolicy: "no-cache",
    });
    if (!res || !res.data || !res.data.fetchChat) {
      dispatch(
        showMessage({ success: false, message: "Fetching chat failed" })
      );
    }
    dispatch(navigate("Dms"));
    dispatch({
      type: SET_ACTIVE_CHATS,
      payload: {
        activeChats: res.data.fetchChat.chatMessages,
        activeChatId: res.data.fetchChat.id,
      },
    });
    return res.data.fetchChat;
  } catch (err) {
    console.log(err);
  }
};

export const viewChats = (skipMult) => async (dispatch) => {
  try {
    const res = await client.query({
      query: FETCH_CHATS_QUERY,
      variables: { skipMult },
      fetchPolicy: "no-cache",
    });
    if (!res || !res.data || !res.data.fetchChats) {
      dispatch(
        showMessage({ success: false, message: "Fetching chat failed" })
      );
    }
    dispatch({
      type: SET_CHATS,
      payload: res.data.fetchChats,
    });
    return res.data.fetchChats;
  } catch (err) {
    console.log(err);
  }
};

export const viewMoreChats = (skipMult, chatId) => async (dispatch) => {
  try {
    const res = await client.query({
      query: FETCH_CHAT_MESSAGES_QUERY,
      variables: { skipMult, chatId },
      fetchPolicy: "no-cache",
    });
    if (!res || !res.data || !res.data.fetchChatMessages) {
      dispatch(
        showMessage({ success: false, message: "Fetching chat failed" })
      );
    }
    dispatch({
      type: ADD_CHATS,
      payload: res.data.fetchChatMessages,
    });
    return res.data.fetchChatMessages;
  } catch (err) {
    console.log(err);
  }
};
