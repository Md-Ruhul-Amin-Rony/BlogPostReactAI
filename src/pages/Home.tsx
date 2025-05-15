import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPosts, fetchFeedPosts } from '../features/posts/postSlice';
import { AppDispatch, RootState } from '../app/store';
import PostCard from '../components/posts/PostCard';
import PostSkeleton from '../components/posts/PostSkeleton';
import { Rss, Globe } from 'lucide-react';

const Home = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { posts, feedPosts, loading } = useSelector((state: RootState) => state.posts);
  const [activeTab, setActiveTab] = useState<'feed' | 'explore'>(isAuthenticated ? 'feed' : 'explore');

  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(fetchFeedPosts(user.id));
    }
    dispatch(fetchPosts());
  }, [dispatch, isAuthenticated, user]);

  useEffect(() => {
    if (!isAuthenticated) {
      setActiveTab('explore');
    }
  }, [isAuthenticated]);

  const displayPosts = activeTab === 'feed' ? feedPosts : posts;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to BlogSocial</h1>
        <p className="text-gray-600">Share your thoughts and connect with others</p>
      </div>

      {isAuthenticated && (
        <div className="flex mb-6 border-b border-gray-200">
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'feed'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('feed')}
          >
            <div className="flex items-center">
              <Rss className="w-4 h-4 mr-1" />
              Your Feed
            </div>
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'explore'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('explore')}
          >
            <div className="flex items-center">
              <Globe className="w-4 h-4 mr-1" />
              Explore
            </div>
          </button>
        </div>
      )}

      <div className="space-y-6">
        {loading ? (
          // Show skeletons while loading
          Array(3)
            .fill(null)
            .map((_, index) => <PostSkeleton key={index} />)
        ) : displayPosts.length > 0 ? (
          displayPosts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              {activeTab === 'feed'
                ? "Your feed is empty. Follow some users to see their posts here!"
                : "No posts available at the moment."}
            </p>
            {activeTab === 'feed' && (
              <button
                onClick={() => setActiveTab('explore')}
                className="btn btn-secondary"
              >
                Explore Posts
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;