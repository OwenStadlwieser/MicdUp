import { gql } from "@apollo/client";

const GET_USER_QUERY = gql`
  query getUser {
    getUser {
      id
      userName
      email
      phone
      dob
      profile {
        id
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

export {
  GET_USER_QUERY,
  DELETE_ACCOUNT_MUTATION,
  VERIFY_EMAIL_MUTATION,
  SET_EMAIL_VERIFIED_MUTATION,
};
