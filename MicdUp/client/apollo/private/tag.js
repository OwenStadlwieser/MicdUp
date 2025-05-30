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

const GET_RANDOM_PROMPT_QUERY = gql`
  query randomPrompt {
    randomPrompt {
      _id
      prompt
      tag {
        _id
        title
      }
    }
  }
`;

export { GET_TAGS_QUERY, GET_RANDOM_PROMPT_QUERY };
