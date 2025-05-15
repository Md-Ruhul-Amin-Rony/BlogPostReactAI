import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import postService from '../../services/postService';
import { PostState, Post } from '../../types';

const initialState: PostState = {
  posts: [],
  currentPost: null,
  userPosts: [],
  feedPosts: [],
  loading: false,
  error: null,
};

// Get all posts
export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
  return postService.getAllPosts();
});

// Get post by ID
export const fetchPostById = createAsyncThunk(
  'posts/fetchPostById',
  async (id: string, { rejectWithValue }) => {
    const post = postService.getPostById(id);
    if (!post) {
      return rejectWithValue('Post not found');
    }
    return post;
  }
);

// Get posts by user ID
export const fetchPostsByUserId = createAsyncThunk(
  'posts/fetchPostsByUserId',
  async (userId: string) => {
    return postService.getPostsByUserId(userId);
  }
);

// Create post
export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData: Pick<Post, 'title' | 'content' | 'authorId'>) => {
    return postService.createPost(postData);
  }
);

// Update post
export const updatePost = createAsyncThunk(
  'posts/updatePost',
  async ({ id, postData }: { id: string; postData: Partial<Post> }, { rejectWithValue }) => {
    const post = postService.updatePost(id, postData);
    if (!post) {
      return rejectWithValue('Post not found');
    }
    return post;
  }
);

// Delete post
export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (id: string, { rejectWithValue }) => {
    const result = postService.deletePost(id);
    if (!result) {
      return rejectWithValue('Post not found');
    }
    return id;
  }
);

// Get feed posts
export const fetchFeedPosts = createAsyncThunk(
  'posts/fetchFeedPosts',
  async (userId: string) => {
    return postService.getFeedPosts(userId);
  }
);

// Like post
export const likePost = createAsyncThunk(
  'posts/likePost',
  async ({ userId, postId }: { userId: string; postId: string }) => {
    postService.likePost(userId, postId);
    return { userId, postId };
  }
);

// Unlike post
export const unlikePost = createAsyncThunk(
  'posts/unlikePost',
  async ({ userId, postId }: { userId: string; postId: string }) => {
    postService.unlikePost(userId, postId);
    return { userId, postId };
  }
);

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearPostError: (state) => {
      state.error = null;
    },
    clearCurrentPost: (state) => {
      state.currentPost = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all posts
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch posts';
      })
      
      // Fetch post by ID
      .addCase(fetchPostById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPost = action.payload;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch posts by user ID
      .addCase(fetchPostsByUserId.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPostsByUserId.fulfilled, (state, action) => {
        state.loading = false;
        state.userPosts = action.payload;
      })
      .addCase(fetchPostsByUserId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user posts';
      })
      
      // Create post
      .addCase(createPost.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = [action.payload, ...state.posts];
        state.userPosts = [action.payload, ...state.userPosts];
        state.feedPosts = [action.payload, ...state.feedPosts];
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create post';
      })
      
      // Update post
      .addCase(updatePost.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.loading = false;
        const updatedPost = action.payload;
        state.posts = state.posts.map(post => 
          post.id === updatedPost.id ? updatedPost : post
        );
        state.userPosts = state.userPosts.map(post => 
          post.id === updatedPost.id ? updatedPost : post
        );
        state.feedPosts = state.feedPosts.map(post => 
          post.id === updatedPost.id ? updatedPost : post
        );
        state.currentPost = updatedPost;
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete post
      .addCase(deletePost.pending, (state) => {
        state.loading = true;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload;
        state.posts = state.posts.filter(post => post.id !== deletedId);
        state.userPosts = state.userPosts.filter(post => post.id !== deletedId);
        state.feedPosts = state.feedPosts.filter(post => post.id !== deletedId);
        if (state.currentPost?.id === deletedId) {
          state.currentPost = null;
        }
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch feed posts
      .addCase(fetchFeedPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFeedPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.feedPosts = action.payload;
      })
      .addCase(fetchFeedPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch feed';
      });
  },
});

export const { clearPostError, clearCurrentPost } = postSlice.actions;
export default postSlice.reducer;