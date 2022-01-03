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
      }
    }
  }
`;

export { GET_USER_QUERY };
