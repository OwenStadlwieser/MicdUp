import { gql } from "@apollo/client";

const GET_USER_QUERY = gql`
  query getUser {
    getUser {
      id
    }
  }
`;

export { GET_USER_QUERY };
