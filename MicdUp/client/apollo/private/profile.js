import { gql } from "@apollo/client";

const UPDATE_PROFILE_PIC_MUTATION = gql`
  mutation updateProfilePic($file: String!, $fileType: String!) {
    updateProfilePic(file: $file, fileType: $fileType) {
      id
      signedUrl
    }
  }
`;

export { UPDATE_PROFILE_PIC_MUTATION };
