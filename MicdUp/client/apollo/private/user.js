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

export { GET_USER_QUERY, DELETE_ACCOUNT_MUTATION };
