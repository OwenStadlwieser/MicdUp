import { gql } from "@apollo/client";

const FETCH_CHAT_MESSAGES_QUERY = gql`
  query fetchChatMessages($skipMult: Int!, $chatId: ID!) {
    fetchChatMessages(skipMult: $skipMult, chatId: $chatId) {
      id
      owner {
        id
        image {
          id
          signedUrl
        }
        user {
          _id
          userName
        }
      }
      isLikedByUser
      likersCount
      seenBy
      signedUrl
      dateCreated
    }
  }
`;
const FETCH_CHATS_QUERY = gql`
  query fetchChats($skipMult: Int!) {
    fetchChats(skipMult: $skipMult) {
      id
      creator {
        id
        user {
          _id
          userName
        }
      }
      members {
        id
        image {
          id
          signedUrl
        }
        user {
          _id
          userName
        }
      }
      chatMessages {
        id
        owner {
          id
          image {
            id
            signedUrl
          }
          user {
            _id
            userName
          }
        }
        isLikedByUser
        likersCount
        seenBy
        signedUrl
        dateCreated
      }
    }
  }
`;

const FETCH_CHAT_MUTATION = gql`
  mutation fetchChat($members: [ID!], $creator: ID!) {
    fetchChat(members: $members, creator: $creator) {
      id
      creator {
        id
        user {
          _id
          userName
        }
      }
      members {
        id
        image {
          id
          signedUrl
        }
        user {
          _id
          userName
        }
      }
      chatMessages {
        id
        isLikedByUser
        likersCount
        seenBy
        signedUrl
        dateCreated
      }
    }
  }
`;

export { FETCH_CHATS_QUERY, FETCH_CHAT_MUTATION, FETCH_CHAT_MESSAGES_QUERY };
