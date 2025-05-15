import db from '../lib/db';
import { Post } from '../types';

// Get all posts
const getAllPosts = (): Post[] => {
  return db.getPosts().sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

// Get post by ID
const getPostById = (id: string): Post | undefined => {
  return db.getPostById(id);
};

// Get posts by user ID
const getPostsByUserId = (userId: string): Post[] => {
  return db.getPostsByUserId(userId).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

// Create post
const createPost = (postData: Pick<Post, 'title' | 'content' | 'authorId'>): Post => {
  return db.createPost(postData);
};

// Update post
const updatePost = (id: string, postData: Partial<Post>): Post | undefined => {
  return db.updatePost(id, postData);
};

// Delete post
const deletePost = (id: string): boolean => {
  return db.deletePost(id);
};

// Get feed posts (posts from users that the current user follows)
const getFeedPosts = (userId: string): Post[] => {
  // Get all users that the current user follows
  const following = db.getFollowingByUserId(userId).map(follow => follow.followedId);
  
  // Get all posts from those users
  const posts = db.getPosts().filter(post => 
    following.includes(post.authorId) || post.authorId === userId
  );
  
  // Sort by date (newest first)
  return posts.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

// Like post
const likePost = (userId: string, postId: string): boolean => {
  const like = db.createLike({ userId, postId });
  return !!like;
};

// Unlike post
const unlikePost = (userId: string, postId: string): boolean => {
  return db.deleteLike(userId, postId);
};

// Check if user liked post
const hasUserLikedPost = (userId: string, postId: string): boolean => {
  return !!db.getLikeByUserAndPost(userId, postId);
};

// Get post likes count
const getPostLikesCount = (postId: string): number => {
  return db.getLikesByPostId(postId).length;
};

// Get comments by post ID
const getCommentsByPostId = (postId: string) => {
  return db.getCommentsByPostId(postId);
};

const postService = {
  getAllPosts,
  getPostById,
  getPostsByUserId,
  createPost,
  updatePost,
  deletePost,
  getFeedPosts,
  likePost,
  unlikePost,
  hasUserLikedPost,
  getPostLikesCount,
  getCommentsByPostId,
};

export default postService;