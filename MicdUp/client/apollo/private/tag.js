import { gql } from "@apollo/client";
import { tagType } from "./types";
const GET_TAGS_QUERY = gql`
  query searchTags($searchTerm: String!) {
    searchTags(searchTerm: $searchTerm) {
      ${tagType}
    }
  }
`;

const GET_RANDOM_PROMPT_QUERY = gql`
  query randomPrompt {
    randomPrompt {
      _id
      prompt
      tag {
        ${tagType}
      }
    }
  }
`;

const GET_POPULAR_TAGS_QUERY = gql`
  query getPopularTags {
    getPopularTags {
      ${tagType}
    }
  }
`;

const GET_RECOMMENDED_TAGS = gql`
  query getRecommendedTags {
    getRecommendedTags {
      ${tagType}
    }
  }
`;

const FOLLOW_TAG_MUTATION = gql`
  mutation followTopic($tagId: ID!) {
    followTopic(tagId: $tagId) {
      ${tagType}
    }
  }
`;

export {
  GET_TAGS_QUERY,
  GET_RANDOM_PROMPT_QUERY,
  GET_POPULAR_TAGS_QUERY,
  GET_RECOMMENDED_TAGS,
  FOLLOW_TAG_MUTATION,
};
