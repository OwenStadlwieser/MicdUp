import { gql } from "@apollo/client";

const SIGNUP_MUTATION = gql`
  mutation createUser(
    $email: String!
    $phone: String!
    $password: String!
    $user: String!
    $dob: String!
  ) {
    createUser(
      email: $email
      phone: $phone
      password: $password
      user: $user
      dob: $dob
    ) {
      success
      message
    }
  }
`;

const LOGIN_QUERY = gql`
  query login($authenticator: String!, $password: String!) {
    login(authenticator: $authenticator, password: $password) {
      success
      message
    }
  }
`;

const FORGOT_PASS_MUTATION = gql`
  mutation forgotPass($email: String!) {
    forgotPass(email: $email) {
      success
      message
    }
  }
`;

const FORGOT_PASS_CHANGE_MUTATION = gql`
  mutation forgotPassChange(
    $secureCode: String!
    $newPass: String!
    $email: String!
  ) {
    forgotPassChange(
      secureCode: $secureCode
      newPass: $newPass
      email: $email
    ) {
      success
      message
    }
  }
`;

const FORGOT_PASS_VERIFY_QUERY = gql`
  query forgotPassVerify($secureCode: String!, $email: String!) {
    forgotPassVerify(secureCode: $secureCode, email: $email) {
      success
      message
    }
  }
`;

export {
  SIGNUP_MUTATION,
  LOGIN_QUERY,
  FORGOT_PASS_MUTATION,
  FORGOT_PASS_VERIFY_QUERY,
  FORGOT_PASS_CHANGE_MUTATION,
};
