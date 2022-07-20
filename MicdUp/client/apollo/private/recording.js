import { gql } from "@apollo/client";
import { duplicateCommentsString } from "../../reuseableFunctions/helpers";
import { postType, commentType } from "./types";
const UPLOAD_RECORDING_MUTATION = gql`
  mutation createRecording(
    $files: [String!]
    $fileTypes: [String!]
    $title: String!
    $tags: [String!]
    $nsfw: Boolean!
    $allowRebuttal: Boolean!
    $allowStitch: Boolean!
    $privatePost: Boolean!
    $speechToText: [String]
  ) {
    createRecording(
      files: $files
      fileTypes: $fileTypes
      title: $title
      tags: $tags
      nsfw: $nsfw
      allowRebuttal: $allowRebuttal
      allowStitch: $allowStitch
      privatePost: $privatePost
      speechToText: $speechToText
    ) {
      ${postType}
    }
  }
`;
const UPLOAD_BIO_MUTATION = gql`
  mutation uploadBio(
    $files: String!
    $fileTypes: String!
    $speechToText: [String]
  ) {
    uploadBio(
      files: $files
      fileTypes: $fileTypes
      speechToText: $speechToText
    ) {
      id
      signedUrl
      speechToText {
        word
        time
      }
    }
  }
`;

const GET_USER_POSTS_QUERY = gql`
  query getUserPosts($userId: ID!, $skipMult: Int!) {
    getUserPosts(userId: $userId, skipMult: $skipMult) {
      ${postType}
    }
  }
`;

const LIKE_POST_MUTATION = gql`
  mutation likePost($postId: ID!) {
    likePost(postId: $postId) {
      ${postType}
    }
  }
`;

const DELETE_POST_MUTATION = gql`
  mutation deletePost($postId: ID!) {
    deletePost(postId: $postId) {
      success
      message
    }
  }
`;

const ADD_TAG_MUTATION = gql`
  mutation addTag($tagId: ID!) {
    addTag(tagId: $tagId) {
      id
    }
  }
`;

const GET_RECORDINGS_FROM_TAG_QUERY = gql`
  query getRecordingsFromTag($searchTag: ID!, $skipMult: Int!) {
    getRecordingsFromTag(searchTag: $searchTag, skipMult: $skipMult) {
      ${postType}
    }
  }
`;

const GET_COMMENT_POST_QUERY = gql`
  query getComments($postId: ID!, $skipMult: Int!) {
    getComments(postId: $postId, skipMult: $skipMult) {
      ${commentType}
      allReplies {
        ${commentType}
      }
    }
  }
`;

const ADD_LISTENER_LOGGED_IN_MUTATION = gql`
  mutation addListenerAuthenticated($postId: ID!, $listenTime: Float!) {
    addListenerAuthenticated(postId: $postId, listenTime: $listenTime) {
      ${postType}
    }
  }
`;

const ADD_LISTENER_NOT_LOGGED_IN_MUTATION = gql`
  mutation addListener($postId: ID!, $ipAddr: String, $listenTime: Float!) {
    addListener(postId: $postId, ipAddr: $ipAddr, listenTime: $listenTime) {
      ${postType}
    }
  }
`;

const GET_SPECIFIC_POST_QUERY = gql`
  query getSpecificPost($postId: ID!) {
    getSpecificPost(postId: $postId) {
      ${postType}
    }
  }
`;

const COMMENT_POST_MUTATION = (duplication) => {
  return gql`
    mutation commentToPost(
      $postId: ID!
      $replyingTo: ID
      $files: String
      $fileTypes: String
      $text: String
      $speechToText: [String]
    ) {
      commentToPost(
        postId: $postId
        replyingTo: $replyingTo
        files: $files
        fileTypes: $fileTypes
        text: $text
        speechToText: $speechToText
      ) {
        ${commentType}
        ${duplicateCommentsString(duplication)}
      }
    }
  `;
};

export {
  UPLOAD_RECORDING_MUTATION,
  UPLOAD_BIO_MUTATION,
  GET_USER_POSTS_QUERY,
  LIKE_POST_MUTATION,
  DELETE_POST_MUTATION,
  COMMENT_POST_MUTATION,
  ADD_TAG_MUTATION,
  GET_COMMENT_POST_QUERY,
  GET_RECORDINGS_FROM_TAG_QUERY,
  ADD_LISTENER_NOT_LOGGED_IN_MUTATION,
  ADD_LISTENER_LOGGED_IN_MUTATION,
  GET_SPECIFIC_POST_QUERY,
};
