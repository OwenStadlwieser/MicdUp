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
      token
    }
  }
`;

export { SIGNUP_MUTATION, LOGIN_QUERY };
