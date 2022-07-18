const LIKE_MESSAGE = "liked";
const FOLLOW_MESSAGE = "followed you";
const COMMENT_MESSAGE = "commented on";
const REPLY_MESSAGE = "replied to your comment";

const NotificationTypesBackend = {
  // done
  LikePost: "LikePost",
  // done
  LikeComment: "LikeComment",
  // done
  Follow: "Follow",
  // done
  CommentPost: "CommentPost",
  // done
  ReplyComment: "ReplyComment",
  // add to privates?
};

const PostToContentType = {
  LikePost: "Post",
  LikeComment: "Comment",
  Follow: "Profile",
  CommentPost: "Post",
  ReplyComment: "Comment",
};
module.exports = {
  LIKE_MESSAGE,
  NotificationTypesBackend,
  PostToContentType,
  FOLLOW_MESSAGE,
  COMMENT_MESSAGE,
  REPLY_MESSAGE,
};
