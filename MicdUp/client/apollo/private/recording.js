import { gql } from "@apollo/client";

const UPLOAD_RECORDING_MUTATION = gql`
  mutation createRecording(
    $files: [String!]
    $fileTypes: [String!]
    $nsfw: Boolean!
    $allowRebuttal: Boolean!
    $allowStitch: Boolean!
    $privatePost: Boolean!
  ) {
    createRecording(
      files: $files
      fileTypes: $fileTypes
      nsfw: $nsfw
      allowRebuttal: $allowRebuttal
      allowStitch: $allowStitch
      privatePost: $privatePost
    ) {
      filePath
    }
  }
`;

export { UPLOAD_RECORDING_MUTATION };
