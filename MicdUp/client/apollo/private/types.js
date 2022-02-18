const postType = `id
title
signedUrl
likes
isLikedByUser
privatePost
speechToText {
  word
  time
}
owner {
  id
  image {
    id
    signedUrl
  }
}`;

const chatType = `id
owner {
  id
  image {
    id
    signedUrl
  }
  user {
    _id
    userName
  }
}
isLikedByUser
likersCount
seenBy
signedUrl
dateCreated
speechToText {
  word
  time
}`;
const commentType = `id
ultimateParent
isDeleted
signedUrl
text
likes
isLikedByUser
repliesLength
speechToText {
  word
  time
}
owner {
  id
  user {
    _id
    userName
  }
  image {
    id
    signedUrl
  }
}`;

const profilePublicType = `id
  followingCount
  followersCount
  privatesCount
  isFollowedByUser
  isPrivateByUser
  canViewPrivatesFromUser
  bio {
    id
    signedUrl
  }
  image {
    id
    signedUrl
  }
`;
export { postType, commentType, chatType, profilePublicType };
