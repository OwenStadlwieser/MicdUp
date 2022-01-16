import { SET_CHATS, ADD_CHAT, SET_ACTIVE_CHATS } from "../types";

const initialState = {
  chats: [],
  activeChatId: "",
  activeChats: [],
  showingChat: false,
};

export default function (state = { ...initialState }, action) {
  const { type, payload } = action;
  switch (type) {
    case SET_CHATS:
      return {
        ...state,
        chats: payload,
      };
    case ADD_CHAT:
      return {
        ...state,
        activeChats: [payload, ...activeChats],
      };
    case ADD_CHATS:
      return {
        ...state,
        activeChats: [...activeChats, payload],
        showingChat: true,
      };
    case SET_ACTIVE_CHATS:
      return {
        ...state,
        activeChats: [...payload.activeChats],
        activeChatId: payload.activeChatId,
        showingChat: true,
      };
    default:
      return state;
  }
}
