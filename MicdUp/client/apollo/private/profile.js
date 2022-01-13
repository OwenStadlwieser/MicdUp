import { gql } from "@apollo/client";

const UPDATE_PROFILE_PIC_MUTATION = gql`
  mutation updateProfilePic($file: String!, $fileType: String!) {
    updateProfilePic(file: $file, fileType: $fileType) {
      id
      signedUrl
    }
  }
`;

const FOLLOW_PROFILE_MUTATION = gql`
  mutation followProfile($profileId: ID!) {
    followProfile(profileId: $profileId) {
      id
      followersCount
      isFollowedByUser
    }
  }
`;

export { UPDATE_PROFILE_PIC_MUTATION, FOLLOW_PROFILE_MUTATION };
