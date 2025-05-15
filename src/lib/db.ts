import { v4 as uuidv4 } from 'uuid';
import { Post, User, Comment, Like, Follow } from '../types';

// In-memory database
class InMemoryDB {
  private users: User[] = [];
  private posts: Post[] = [];
  private comments: Comment[] = [];
  private likes: Like[] = [];
  private follows: Follow[] = [];

  constructor() {
    this.seedData();
  }

  // User methods
  getUsers(): User[] {
    return [...this.users];
  }

  getUserById(id: string): User | undefined {
    return this.users.find(user => user.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.users.find(user => user.email === email);
  }

  createUser(userData: Omit<User, 'id' | 'createdAt'>): User {
    const newUser: User = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      ...userData,
    };
    this.users = [...this.users, newUser];
    return { ...newUser };
  }

  updateUser(id: string, userData: Partial<User>): User | undefined {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) return undefined;
    
    const updatedUser = { ...this.users[index], ...userData };
    this.users = [
      ...this.users.slice(0, index),
      updatedUser,
      ...this.users.slice(index + 1)
    ];
    return { ...updatedUser };
  }

  // Post methods
  getPosts(): Post[] {
    return [...this.posts];
  }

  getPostById(id: string): Post | undefined {
    const post = this.posts.find(post => post.id === id);
    return post ? { ...post } : undefined;
  }

  getPostsByUserId(userId: string): Post[] {
    return this.posts
      .filter(post => post.authorId === userId)
      .map(post => ({ ...post }));
  }

  createPost(postData: Omit<Post, 'id' | 'createdAt'>): Post {
    const newPost: Post = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      ...postData,
    };
    this.posts = [...this.posts, newPost];
    return { ...newPost };
  }

  updatePost(id: string, postData: Partial<Post>): Post | undefined {
    const index = this.posts.findIndex(post => post.id === id);
    if (index === -1) return undefined;
    
    const updatedPost = { ...this.posts[index], ...postData };
    this.posts = [
      ...this.posts.slice(0, index),
      updatedPost,
      ...this.posts.slice(index + 1)
    ];
    return { ...updatedPost };
  }

  deletePost(id: string): boolean {
    const initialLength = this.posts.length;
    this.posts = this.posts.filter(post => post.id !== id);
    
    // Also delete related comments and likes
    this.comments = this.comments.filter(comment => comment.postId !== id);
    this.likes = this.likes.filter(like => like.postId !== id);
    
    return initialLength > this.posts.length;
  }

  // Comment methods
  getComments(): Comment[] {
    return [...this.comments];
  }

  getCommentsByPostId(postId: string): Comment[] {
    return this.comments
      .filter(comment => comment.postId === postId)
      .map(comment => ({ ...comment }));
  }

  createComment(commentData: Omit<Comment, 'id' | 'createdAt'>): Comment {
    const newComment: Comment = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      ...commentData,
    };
    this.comments = [...this.comments, newComment];
    return { ...newComment };
  }

  deleteComment(id: string): boolean {
    const initialLength = this.comments.length;
    this.comments = this.comments.filter(comment => comment.id !== id);
    return initialLength > this.comments.length;
  }

  // Like methods
  getLikes(): Like[] {
    return [...this.likes];
  }

  getLikesByPostId(postId: string): Like[] {
    return this.likes
      .filter(like => like.postId === postId)
      .map(like => ({ ...like }));
  }

  getLikeByUserAndPost(userId: string, postId: string): Like | undefined {
    const like = this.likes.find(like => like.userId === userId && like.postId === postId);
    return like ? { ...like } : undefined;
  }

  createLike(likeData: Omit<Like, 'id'>): Like {
    // Check if user already liked the post
    const existingLike = this.getLikeByUserAndPost(likeData.userId, likeData.postId);
    if (existingLike) return { ...existingLike };
    
    const newLike: Like = {
      id: uuidv4(),
      ...likeData,
    };
    this.likes = [...this.likes, newLike];
    return { ...newLike };
  }

  deleteLike(userId: string, postId: string): boolean {
    const initialLength = this.likes.length;
    this.likes = this.likes.filter(like => !(like.userId === userId && like.postId === postId));
    return initialLength > this.likes.length;
  }

  // Follow methods
  getFollows(): Follow[] {
    return [...this.follows];
  }

  getFollowersByUserId(followedId: string): Follow[] {
    return this.follows
      .filter(follow => follow.followedId === followedId)
      .map(follow => ({ ...follow }));
  }

  getFollowingByUserId(followerId: string): Follow[] {
    return this.follows
      .filter(follow => follow.followerId === followerId)
      .map(follow => ({ ...follow }));
  }

  getFollow(followerId: string, followedId: string): Follow | undefined {
    const follow = this.follows.find(
      follow => follow.followerId === followerId && follow.followedId === followedId
    );
    return follow ? { ...follow } : undefined;
  }

  createFollow(followData: Omit<Follow, 'id'>): Follow {
    // Check if already following
    const existingFollow = this.getFollow(followData.followerId, followData.followedId);
    if (existingFollow) return { ...existingFollow };
    
    const newFollow: Follow = {
      id: uuidv4(),
      ...followData,
    };
    this.follows = [...this.follows, newFollow];
    return { ...newFollow };
  }

  deleteFollow(followerId: string, followedId: string): boolean {
    const initialLength = this.follows.length;
    this.follows = this.follows.filter(
      follow => !(follow.followerId === followerId && follow.followedId === followedId)
    );
    return initialLength > this.follows.length;
  }

  // Seed initial data
  private seedData() {
    // Create sample users
    const user1 = this.createUser({
      username: 'johndoe',
      email: 'john@example.com',
      password: 'password123',
      profilePicture: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
      bio: 'Tech enthusiast and coffee lover',
    });

    const user2 = this.createUser({
      username: 'janedoe',
      email: 'jane@example.com',
      password: 'password123',
      profilePicture: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
      bio: 'Travel blogger and photographer',
    });

    const user3 = this.createUser({
      username: 'mikesmith',
      email: 'mike@example.com',
      password: 'password123',
      profilePicture: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg',
      bio: 'Software developer and hiking enthusiast',
    });

    // Create sample posts
    const post1 = this.createPost({
      title: 'Getting Started with React',
      content: 'React is a JavaScript library for building user interfaces. It lets you compose complex UIs from small and isolated pieces of code called "components".',
      authorId: user1.id,
    });

    const post2 = this.createPost({
      title: 'My Trip to the Mountains',
      content: 'Last weekend, I took a trip to the mountains. The views were breathtaking and the experience was unforgettable. Here are some thoughts on mountain hiking and what to bring with you.',
      authorId: user2.id,
    });

    const post3 = this.createPost({
      title: 'The Future of Web Development',
      content: 'Web development is constantly evolving. From static HTML pages to complex web applications, the journey has been remarkable. Where are we headed next?',
      authorId: user3.id,
    });

    // Create sample comments
    this.createComment({
      content: 'Great post! I found it very helpful.',
      authorId: user2.id,
      postId: post1.id,
    });

    this.createComment({
      content: 'Those views are amazing! Which mountain range was this?',
      authorId: user1.id,
      postId: post2.id,
    });

    this.createComment({
      content: 'I agree, WebAssembly will change everything!',
      authorId: user1.id,
      postId: post3.id,
    });

    // Create sample likes
    this.createLike({
      userId: user2.id,
      postId: post1.id,
    });

    this.createLike({
      userId: user3.id,
      postId: post1.id,
    });

    this.createLike({
      userId: user1.id,
      postId: post2.id,
    });

    // Create sample follows
    this.createFollow({
      followerId: user1.id,
      followedId: user2.id,
    });

    this.createFollow({
      followerId: user1.id,
      followedId: user3.id,
    });

    this.createFollow({
      followerId: user2.id,
      followedId: user1.id,
    });
  }
}

// Create and export a singleton instance
const db = new InMemoryDB();
export default db;