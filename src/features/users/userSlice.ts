import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import userService from '../../services/userService';
import { UserState, User } from '../../types';

const initialState: UserState = {
  users: [],
  currentUser: null,
  followers: [],
  following: [],
  loading: false,
  error: null,
};

// Get all users
export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
  return userService.getAllUsers();
});

// Get user by ID
export const fetchUserById = createAsyncThunk(
  'users/fetchUserById',
  async (id: string, { rejectWithValue }) => {
    const user = userService.getUserById(id);
    if (!user) {
      return rejectWithValue('User not found');
    }
    return user;
  }
);

// Follow user
export const followUser = createAsyncThunk(
  'users/followUser',
  async ({ followerId, followedId }: { followerId: string; followedId: string }) => {
    userService.followUser(followerId, followedId);
    return { followerId, followedId };
  }
);

// Unfollow user
export const unfollowUser = createAsyncThunk(
  'users/unfollowUser',
  async ({ followerId, followedId }: { followerId: string; followedId: string }) => {
    userService.unfollowUser(followerId, followedId);
    return { followerId, followedId };
  }
);

// Get user followers
export const fetchUserFollowers = createAsyncThunk(
  'users/fetchUserFollowers',
  async (userId: string) => {
    return userService.getUserFollowers(userId);
  }
);

// Get user following
export const fetchUserFollowing = createAsyncThunk(
  'users/fetchUserFollowing',
  async (userId: string) => {
    return userService.getUserFollowing(userId);
  }
);

// Update profile picture
export const updateProfilePicture = createAsyncThunk(
  'users/updateProfilePicture',
  async ({ userId, profilePicture }: { userId: string; profilePicture: string }, { rejectWithValue }) => {
    const updatedUser = userService.updateProfilePicture(userId, profilePicture);
    if (!updatedUser) {
      return rejectWithValue('User not found');
    }
    return updatedUser;
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch users';
      })
      
      // Fetch user by ID
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch user followers
      .addCase(fetchUserFollowers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserFollowers.fulfilled, (state, action) => {
        state.loading = false;
        state.followers = action.payload;
      })
      .addCase(fetchUserFollowers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch followers';
      })
      
      // Fetch user following
      .addCase(fetchUserFollowing.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserFollowing.fulfilled, (state, action) => {
        state.loading = false;
        state.following = action.payload;
      })
      .addCase(fetchUserFollowing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch following';
      })
      
      // Update profile picture
      .addCase(updateProfilePicture.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProfilePicture.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.users = state.users.map(user => 
          user.id === action.payload.id ? action.payload : user
        );
      })
      .addCase(updateProfilePicture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearUserError } = userSlice.actions;
export default userSlice.reducer;