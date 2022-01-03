import { gql } from "@apollo/client";

const UPLOAD_RECORDING_MUTATION = gql`
  mutation createRecording(
    $files: [String!]
    $fileTypes: [String!]
    $tags: [String!]
    $nsfw: Boolean!
    $allowRebuttal: Boolean!
    $allowStitch: Boolean!
    $privatePost: Boolean!
  ) {
    createRecording(
      files: $files
      fileTypes: $fileTypes
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

export { UPLOAD_RECORDING_MUTATION, UPLOAD_BIO_MUTATION };
