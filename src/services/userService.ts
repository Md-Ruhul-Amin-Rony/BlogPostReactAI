import db from '../lib/db';
import { User } from '../types';

// Get all users
const getAllUsers = (): User[] => {
  // Return users without passwords
  return db.getUsers().map(({ password, ...user }) => user as User);
};

// Get user by ID
const getUserById = (id: string): Omit<User, 'password'> | undefined => {
  const user = db.getUserById(id);
  if (!user) return undefined;
  
  // Return user without password
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword as User;
};

// Follow user
const followUser = (followerId: string, followedId: string): boolean => {
  // Can't follow yourself
  if (followerId === followedId) return false;
  
  const follow = db.createFollow({ followerId, followedId });
  return !!follow;
};

// Unfollow user
const unfollowUser = (followerId: string, followedId: string): boolean => {
  return db.deleteFollow(followerId, followedId);
};

// Check if user is following another user
const isFollowing = (followerId: string, followedId: string): boolean => {
  return !!db.getFollow(followerId, followedId);
};

// Get user followers
const getUserFollowers = (userId: string): User[] => {
  const followers = db.getFollowersByUserId(userId);
  const followerIds = followers.map(follow => follow.followerId);
  
  // Return users without passwords
  return db.getUsers()
    .filter(user => followerIds.includes(user.id))
    .map(({ password, ...user }) => user as User);
};

// Get users that a user is following
const getUserFollowing = (userId: string): User[] => {
  const following = db.getFollowingByUserId(userId);
  const followingIds = following.map(follow => follow.followedId);
  
  // Return users without passwords
  return db.getUsers()
    .filter(user => followingIds.includes(user.id))
    .map(({ password, ...user }) => user as User);
};

// Get followers count
const getFollowersCount = (userId: string): number => {
  return db.getFollowersByUserId(userId).length;
};

// Get following count
const getFollowingCount = (userId: string): number => {
  return db.getFollowingByUserId(userId).length;
};

// Update profile picture
const updateProfilePicture = (userId: string, profilePicture: string): Omit<User, 'password'> | undefined => {
  const updatedUser = db.updateUser(userId, { profilePicture });
  if (!updatedUser) return undefined;
  
  // Return user without password
  const { password, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword as User;
};

const userService = {
  getAllUsers,
  getUserById,
  followUser,
  unfollowUser,
  isFollowing,
  getUserFollowers,
  getUserFollowing,
  getFollowersCount,
  getFollowingCount,
  updateProfilePicture,
};

export default userService;