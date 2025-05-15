export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  profilePicture?: string;
  bio?: string;
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  postId: string;
  createdAt: string;
}

export interface Like {
  id: string;
  userId: string;
  postId: string;
}

export interface Follow {
  id: string;
  followerId: string;
  followedId: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface PostState {
  posts: Post[];
  currentPost: Post | null;
  userPosts: Post[];
  feedPosts: Post[];
  loading: boolean;
  error: string | null;
}

export interface UserState {
  users: User[];
  currentUser: User | null;
  followers: User[];
  following: User[];
  loading: boolean;
  error: string | null;
}

export interface CommentState {
  comments: Comment[];
  loading: boolean;
  error: string | null;
}