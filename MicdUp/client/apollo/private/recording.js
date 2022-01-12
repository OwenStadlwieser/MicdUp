import { gql } from "@apollo/client";
import { duplicateCommentsString } from "../../reuseableFunctions/helpers";
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
    ) {
      id
      filePath
    }
  }
`;
const UPLOAD_BIO_MUTATION = gql`
  mutation uploadBio($files: String!, $fileTypes: String!) {
    uploadBio(files: $files, fileTypes: $fileTypes) {
      id
      signedUrl
    }
  }
`;

const GET_USER_POSTS_QUERY = gql`
  query getUserPosts($userId: ID!, $skipMult: Int!) {
    getUserPosts(userId: $userId, skipMult: $skipMult) {
      id
      title
      signedUrl
      likes
      isLikedByUser
      owner {
        id
      }
    }
  }
`;

const LIKE_POST_MUTATION = gql`
  mutation likePost($postId: ID!) {
    likePost(postId: $postId) {
      id
      title
      signedUrl
      likes
      isLikedByUser
      owner {
        id
      }
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

const GET_COMMENT_POST_QUERY = gql`
  query getComments($postId: ID!, $skipMult: Int!) {
    getComments(postId: $postId, skipMult: $skipMult) {
      id
      signedUrl
      text
      likes
      repliesLength
      isDeleted
      isLikedByUser
      owner {
        id
        user {
          _id
          userName
        }
        image {
          id
          signedUrl
        }
      }
      allReplies {
        id
        text
        repliesLength
        signedUrl
        isDeleted
        likes
        isLikedByUser
        owner {
          id
          user {
            _id
            userName
          }
          image {
            id
            signedUrl
          }
        }
      }
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
    ) {
      commentToPost(
        postId: $postId
        replyingTo: $replyingTo
        files: $files
        fileTypes: $fileTypes
        text: $text
      ) {
        id
        signedUrl
        text
        likes
        isLikedByUser
        repliesLength
        owner {
          id
          user {
            _id
            userName
          }
          image {
            id
            signedUrl
          }
        }
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
};
