import db from '../lib/db';
import { Comment } from '../types';

// Get comments by post ID
const getCommentsByPostId = (postId: string): Comment[] => {
  return db.getCommentsByPostId(postId).sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
};

// Create comment
const createComment = (commentData: Pick<Comment, 'content' | 'authorId' | 'postId'>): Comment => {
  return db.createComment(commentData);
};

// Delete comment
const deleteComment = (id: string): boolean => {
  return db.deleteComment(id);
};

const commentService = {
  getCommentsByPostId,
  createComment,
  deleteComment,
};

export default commentService;