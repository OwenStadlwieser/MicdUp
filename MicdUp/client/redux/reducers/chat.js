import {
  SET_CHATS,
  ADD_CHAT,
  SET_ACTIVE_CHATS,
  ADD_CHATS,
  HIDE_CHATS,
} from "../types";

const initialState = {
  chats: [],
  activeChatId: "",
  activeChats: [],
  activeChatMembers: [],
  showingChat: false,
};

export default function (state = { ...initialState }, action) {
  const { type, payload } = action;
  switch (type) {
    case HIDE_CHATS:
      return {
        ...state,
        showingChat: false,
        activeChats: [],
        activeChatMembers: [],
        activeChatId: "",
      };
    case SET_CHATS:
      return {
        ...state,
        chats: payload,
      };
    case ADD_CHAT:
      const chats = [...state.chats];
      const chatIndex = chats.findIndex((chat) => chat.id === payload.chatId);
      if (chatIndex < 0) {
        return {
          ...state,
        };
      }
      chats[chatIndex].chatMessages.push(payload.message);
      const activeChats = [...state.activeChats];
      if (state.activeChatId === payload.chatId) {
        activeChats.push(payload.message);
      }
      return {
        ...state,
        activeChats: [...activeChats],
        chats: [...chats],
      };
    case ADD_CHATS:
      return {
        ...state,
        activeChats: [...payload.activeChats, ...state.activeChats],
        activeChatId: payload.activeChatId,
        activeChatMembers: [...payload.activeChatMembers],
        showingChat: true,
      };
    case SET_ACTIVE_CHATS:
      return {
        ...state,
        activeChats: [...payload.activeChats],
        activeChatId: payload.activeChatId,
        activeChatMembers: [...payload.activeChatMembers],
        showingChat: true,
      };
    default:
      return state;
  }
}
