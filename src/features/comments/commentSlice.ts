import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import commentService from '../../services/commentService';
import { CommentState, Comment } from '../../types';

const initialState: CommentState = {
  comments: [],
  loading: false,
  error: null,
};

// Get comments by post ID
export const fetchCommentsByPostId = createAsyncThunk(
  'comments/fetchCommentsByPostId',
  async (postId: string) => {
    return commentService.getCommentsByPostId(postId);
  }
);

// Create comment
export const createComment = createAsyncThunk(
  'comments/createComment',
  async (commentData: Pick<Comment, 'content' | 'authorId' | 'postId'>) => {
    return commentService.createComment(commentData);
  }
);

// Delete comment
export const deleteComment = createAsyncThunk(
  'comments/deleteComment',
  async (id: string, { rejectWithValue }) => {
    const result = commentService.deleteComment(id);
    if (!result) {
      return rejectWithValue('Comment not found');
    }
    return id;
  }
);

const commentSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    clearCommentError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch comments by post ID
      .addCase(fetchCommentsByPostId.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCommentsByPostId.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = action.payload;
      })
      .addCase(fetchCommentsByPostId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch comments';
      })
      
      // Create comment
      .addCase(createComment.pending, (state) => {
        state.loading = true;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = [...state.comments, action.payload];
      })
      .addCase(createComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create comment';
      })
      
      // Delete comment
      .addCase(deleteComment.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = state.comments.filter(comment => comment.id !== action.payload);
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCommentError } = commentSlice.actions;
export default commentSlice.reducer;