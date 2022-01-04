import { gql } from "@apollo/client";

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
    }
  }
`;

export { UPLOAD_RECORDING_MUTATION, UPLOAD_BIO_MUTATION, GET_USER_POSTS_QUERY };
