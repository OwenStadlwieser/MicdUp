import { gql } from "@apollo/client";

const FETCH_CHAT_MESSAGES_QUERY = gql`
  query fetchChats($skipMult: Int!, $chatId: ID!) {
    fetchChats(skipMult: $skipMult, chatId: $chatId) {
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
        user {
          _id
          userName
        }
      }
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
        user {
          userName
        }
      }
      chatMessages {
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
        seenBy
        signedUrl
        dateCreated
      }
    }
  }
`;

const FETCH_CHAT_MUTATION = gql`
  mutation fetchChat($members: [ID!], $owner: ID!) {
    fetchChat(members: $members, owner: $owner) {
      id
      owner {
        user {
          userName
        }
      }
      chatMessages {
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
          user {
            _id
            userName
          }
        }
        seenBy
        signedUrl
        dateCreated
      }
    }
  }
`;

export { FETCH_CHATS_QUERY, FETCH_CHAT_MUTATION, FETCH_CHAT_MESSAGES_QUERY };
