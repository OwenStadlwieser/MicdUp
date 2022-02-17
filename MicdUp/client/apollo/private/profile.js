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

const GET_FOLLOWERS_QUERY = gql`
  query getFollowers($profileId: ID!, $skipMult: Int!) {
    getFollowers(profileId: $profileId, skipMult: $skipMult) {
      followers {
        id
        user {
          _id
          userName
        }
        followingCount
        followersCount
        isFollowedByUser
        privatesCount
        isPrivateByUser
        bio {
          id
          signedUrl
        }
        image {
          id
          signedUrl
        }
      }
    }
  }
`;

const GET_FOLLOWING_QUERY = gql`
  query getFollowing($profileId: ID!, $skipMult: Int!) {
    getFollowing(profileId: $profileId, skipMult: $skipMult) {
      following {
        id
        user {
          _id
          userName
        }
        followingCount
        followersCount
        privatesCount
        isFollowedByUser
        isPrivateByUser
        bio {
          id
          signedUrl
        }
        image {
          id
          signedUrl
        }
      }
    }
  }
`;

const GET_PRIVATES_QUERY = gql`
  query getPrivates($skipMult: Int!) {
    getPrivates(skipMult: $skipMult) {
      privates {
        id
        user {
          _id
          userName
        }
        followingCount
        followersCount
        privatesCount
        isFollowedByUser
        isPrivateByUser
        bio {
          id
          signedUrl
        }
        image {
          id
          signedUrl
        }
      }
    }
  }
`;

const ADD_TO_PRIVATES_MUTATION = gql`
  mutation addToPrivates($profileId: ID!) {
    addToPrivates(profileId: $profileId) {
      id
      privatesCount
      isPrivateByUser
      user {
        userName
      }
    }
  }
`;
export {
  UPDATE_PROFILE_PIC_MUTATION,
  FOLLOW_PROFILE_MUTATION,
  GET_FOLLOWERS_QUERY,
  GET_PRIVATES_QUERY,
  GET_FOLLOWING_QUERY,
  ADD_TO_PRIVATES_MUTATION,
};
