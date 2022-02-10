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
export { postType, commentType, chatType };
