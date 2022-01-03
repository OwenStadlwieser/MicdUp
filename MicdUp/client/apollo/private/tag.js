import { gql } from "@apollo/client";

const GET_TAGS_QUERY = gql`
  query searchTags($searchTerm: String!) {
    searchTags(searchTerm: $searchTerm) {
      _id
      title
      count
    }
  }
`;

export { GET_TAGS_QUERY };
