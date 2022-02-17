import { gql } from "@apollo/client";

const GET_USER_QUERY = gql`
  query getUser {
    getUser {
      _id
      userName
      email
      phone
      dob
      profile {
        id
        followingCount
        followersCount
        privatesCount
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

const DELETE_ACCOUNT_MUTATION = gql`
  mutation deleteAccount {
    deleteAccount {
      success
      message
    }
  }
`;

const VERIFY_EMAIL_MUTATION = gql`
  mutation verifyEmail($email: String!) {
    verifyEmail(email: $email) {
      success
      message
    }
  }
`;

const SET_EMAIL_VERIFIED_MUTATION = gql`
  mutation setEmailVerified($verificationCode: String!, $email: String) {
    setEmailVerified(verificationCode: $verificationCode, email: $email) {
      success
      message
    }
  }
`;

const SEARCH_USERS_QUERY = gql`
  query searchUsers($searchTerm: String!, $skipMult: Int!) {
    searchUsers(searchTerm: $searchTerm, skipMult: $skipMult) {
      _id
      userName
      profile {
        id
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

export {
  GET_USER_QUERY,
  DELETE_ACCOUNT_MUTATION,
  VERIFY_EMAIL_MUTATION,
  SET_EMAIL_VERIFIED_MUTATION,
  SEARCH_USERS_QUERY,
};
