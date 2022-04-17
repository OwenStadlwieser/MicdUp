import { gql } from "@apollo/client";
import { postType } from "./types";
const GET_FOLLOWING_FEED = gql`
  query getFollowingFeed(
    $skipMult: Int!
  ) {
    getFollowingFeed(
      skipMult: $skipMult
    ) {
      ${postType}
    }
  }
`;

const GET_TOPICS_FEED = gql`
  query getFollowingTopicsFeed(
    $skipMult: Int!
  ) {
    getFollowingTopicsFeed(
      skipMult: $skipMult
    ) {
      ${postType}
    }
  }
`;

const GET_NOT_LOGGED_IN_FEED = gql`
  query getNotLoggedInFeed(
    $skipMult: Int!
  ) {
    getNotLoggedInFeed(
      skipMult: $skipMult
    ) {
      ${postType}
    }
  }
`;

export { GET_FOLLOWING_FEED, GET_TOPICS_FEED, GET_NOT_LOGGED_IN_FEED };
