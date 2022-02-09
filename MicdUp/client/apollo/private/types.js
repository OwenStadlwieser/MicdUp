const postType = `id
title
signedUrl
likes
isLikedByUser
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
export { postType, commentType };
