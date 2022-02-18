import { gql } from "@apollo/client";
import { profilePublicType } from "./types";
const GET_USER_QUERY = gql`
  query getUser {
    getUser {
      _id
      userName
      email
      phone
      dob
      profile {
        ${profilePublicType}
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
        ${profilePublicType}
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
