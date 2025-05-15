import { useEffect, useState, FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import { Edit, Upload, User, UserPlus, UserMinus, Users, AlertCircle } from 'lucide-react';
import { AppDispatch, RootState } from '../app/store';
import { fetchUserById, followUser, unfollowUser, fetchUserFollowers, fetchUserFollowing, updateProfilePicture } from '../features/users/userSlice';
import { fetchPostsByUserId } from '../features/posts/postSlice';
import PostCard from '../components/posts/PostCard';
import userService from '../services/userService';

const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  
  const { currentUser, followers, following, loading, error } = useSelector((state: RootState) => state.users);
  const { userPosts, loading: postsLoading } = useSelector((state: RootState) => state.posts);
  const { user: loggedInUser, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [isEditing, setIsEditing] = useState(false);
  const [profilePicture, setProfilePicture] = useState('');
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'posts' | 'followers' | 'following'>('posts');
  
  useEffect(() => {
    if (id) {
      dispatch(fetchUserById(id));
      dispatch(fetchPostsByUserId(id));
      dispatch(fetchUserFollowers(id));
      dispatch(fetchUserFollowing(id));
    }
  }, [dispatch, id]);
  
  useEffect(() => {
    if (currentUser) {
      setProfilePicture(currentUser.profilePicture || '');
      setProfilePicturePreview(currentUser.profilePicture || null);
      
      // Get followers count directly from service for immediate display
      setFollowersCount(userService.getFollowersCount(currentUser.id));
      setFollowingCount(userService.getFollowingCount(currentUser.id));
      
      // Check if logged in user is following this profile
      if (isAuthenticated && loggedInUser && loggedInUser.id !== currentUser.id) {
        setIsFollowing(userService.isFollowing(loggedInUser.id, currentUser.id));
      }
    }
  }, [currentUser, isAuthenticated, loggedInUser]);
  
  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Create a temporary URL for preview
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const result = reader.result as string;
        setProfilePicturePreview(result);
        setProfilePicture(result);
      };
      
      reader.readAsDataURL(file);
    }
  };
  
  const handleSaveProfilePicture = (e: FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !loggedInUser || !currentUser) return;
    
    dispatch(
      updateProfilePicture({
        userId: loggedInUser.id,
        profilePicture,
      })
    ).then(() => {
      setIsEditing(false);
    });
  };
  
  const handleFollowToggle = () => {
    if (!isAuthenticated || !loggedInUser || !currentUser) return;
    
    if (isFollowing) {
      dispatch(unfollowUser({ followerId: loggedInUser.id, followedId: currentUser.id }));
      setIsFollowing(false);
      setFollowersCount(prev => prev - 1);
    } else {
      dispatch(followUser({ followerId: loggedInUser.id, followedId: currentUser.id }));
      setIsFollowing(true);
      setFollowersCount(prev => prev + 1);
    }
  };
  
  const isOwnProfile = isAuthenticated && loggedInUser && currentUser && loggedInUser.id === currentUser.id;
  
  if (loading && !currentUser) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }
  
  if (!currentUser && !loading) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
        <p className="text-gray-500 mb-4">The user you're looking for could not be found.</p>
        <Link to="/" className="btn btn-primary">
          Go Home
        </Link>
      </div>
    );
  }
  
  return (
    <div>
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-start mb-4 animate-fade-in">
          <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {currentUser && (
        <div className="animate-fade-in">
          <div className="flex flex-col sm:flex-row items-center sm:items-start mb-8">
            <div className="mb-4 sm:mb-0 sm:mr-6">
              {isEditing ? (
                <form onSubmit={handleSaveProfilePicture}>
                  <div className="relative">
                    <div className="avatar-xl overflow-hidden border-2 border-white shadow-sm">
                      {profilePicturePreview ? (
                        <img 
                          src={profilePicturePreview} 
                          alt={currentUser.username} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                          <User className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <label 
                      htmlFor="profilePicture"
                      className="absolute bottom-0 right-0 bg-primary-500 text-white p-1 rounded-full cursor-pointer shadow-md"
                    >
                      <Upload className="w-4 h-4" />
                    </label>
                    <input
                      type="file"
                      id="profilePicture"
                      onChange={handleProfilePictureChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  
                  <div className="mt-2 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="btn btn-ghost text-sm mr-1"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary text-sm"
                      disabled={loading}
                    >
                      Save
                    </button>
                  </div>
                </form>
              ) : (
                <div className="avatar-xl">
                  {currentUser.profilePicture ? (
                    <img 
                      src={currentUser.profilePicture} 
                      alt={currentUser.username} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                      <User className="w-8 h-8" />
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="text-center sm:text-left flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold">{currentUser.username}</h1>
                
                <div className="mt-2 sm:mt-0">
                  {isOwnProfile ? (
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="btn btn-secondary flex items-center"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit Profile
                    </button>
                  ) : isAuthenticated && loggedInUser ? (
                    <button
                      onClick={handleFollowToggle}
                      className={`btn ${isFollowing ? 'btn-ghost border border-gray-300' : 'btn-primary'} flex items-center`}
                    >
                      {isFollowing ? (
                        <>
                          <UserMinus className="w-4 h-4 mr-1" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-1" />
                          Follow
                        </>
                      )}
                    </button>
                  ) : null}
                </div>
              </div>
              
              <p className="text-gray-600 my-2">
                {currentUser.bio || 'No bio available'}
              </p>
              
              <p className="text-gray-500 text-sm">
                Joined {formatDistanceToNow(new Date(currentUser.createdAt), { addSuffix: true })}
              </p>
              
              <div className="flex justify-center sm:justify-start mt-3 space-x-4">
                <button 
                  onClick={() => setActiveTab('posts')}
                  className="text-gray-600 hover:text-gray-900 flex items-center"
                >
                  <span className="font-bold mr-1">{userPosts.length}</span> Posts
                </button>
                <button 
                  onClick={() => setActiveTab('followers')}
                  className="text-gray-600 hover:text-gray-900 flex items-center"
                >
                  <span className="font-bold mr-1">{followersCount}</span> Followers
                </button>
                <button 
                  onClick={() => setActiveTab('following')}
                  className="text-gray-600 hover:text-gray-900 flex items-center"
                >
                  <span className="font-bold mr-1">{followingCount}</span> Following
                </button>
              </div>
            </div>
          </div>
          
          <div className="border-b border-gray-200 mb-6">
            <div className="flex space-x-8">
              <button
                className={`py-2 px-1 font-medium ${
                  activeTab === 'posts'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab('posts')}
              >
                Posts
              </button>
              <button
                className={`py-2 px-1 font-medium ${
                  activeTab === 'followers'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab('followers')}
              >
                Followers
              </button>
              <button
                className={`py-2 px-1 font-medium ${
                  activeTab === 'following'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab('following')}
              >
                Following
              </button>
            </div>
          </div>
          
          {activeTab === 'posts' && (
            <div className="space-y-6">
              {postsLoading ? (
                <p className="text-center py-4 text-gray-500">Loading posts...</p>
              ) : userPosts.length > 0 ? (
                userPosts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-medium mb-1">No posts yet</h3>
                  <p className="text-gray-500">
                    {isOwnProfile ? "You haven't created any posts yet." : "This user hasn't created any posts yet."}
                  </p>
                  {isOwnProfile && (
                    <Link to="/create" className="btn btn-primary mt-4">
                      Create First Post
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'followers' && (
            <div className="space-y-4">
              {followers.length > 0 ? (
                followers.map(follower => (
                  <Link 
                    key={follower.id} 
                    to={`/profile/${follower.id}`}
                    className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="avatar mr-3">
                      {follower.profilePicture ? (
                        <img 
                          src={follower.profilePicture} 
                          alt={follower.username} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{follower.username}</div>
                      <div className="text-sm text-gray-500">{follower.bio || 'No bio available'}</div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-medium mb-1">No followers yet</h3>
                  <p className="text-gray-500">
                    {isOwnProfile ? "You don't have any followers yet." : "This user doesn't have any followers yet."}
                  </p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'following' && (
            <div className="space-y-4">
              {following.length > 0 ? (
                following.map(followedUser => (
                  <Link 
                    key={followedUser.id} 
                    to={`/profile/${followedUser.id}`}
                    className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="avatar mr-3">
                      {followedUser.profilePicture ? (
                        <img 
                          src={followedUser.profilePicture} 
                          alt={followedUser.username} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{followedUser.username}</div>
                      <div className="text-sm text-gray-500">{followedUser.bio || 'No bio available'}</div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-medium mb-1">Not following anyone</h3>
                  <p className="text-gray-500">
                    {isOwnProfile ? "You're not following anyone yet." : "This user isn't following anyone yet."}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;