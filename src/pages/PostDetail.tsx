import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Edit, Trash, ArrowLeft, AlertCircle } from 'lucide-react';
import { AppDispatch, RootState } from '../app/store';
import { fetchPostById, deletePost, likePost, unlikePost } from '../features/posts/postSlice';
import { fetchUserById } from '../features/users/userSlice';
import { fetchCommentsByPostId } from '../features/comments/commentSlice';
import CommentSection from '../components/comments/CommentSection';
import postService from '../services/postService';
import userService from '../services/userService';

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { currentPost, loading, error } = useSelector((state: RootState) => state.posts);
  const { user: currentUser, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { users } = useSelector((state: RootState) => state.users);
  
  const [author, setAuthor] = useState<any>(null);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  
  useEffect(() => {
    if (id) {
      dispatch(fetchPostById(id));
      dispatch(fetchCommentsByPostId(id));
    }
  }, [dispatch, id]);
  
  useEffect(() => {
    if (currentPost) {
      // Fetch author data
      const userFromState = users.find(user => user.id === currentPost.authorId);
      
      if (userFromState) {
        setAuthor(userFromState);
      } else {
        dispatch(fetchUserById(currentPost.authorId));
        
        // Meanwhile, get directly from service for display
        const authorData = userService.getUserById(currentPost.authorId);
        if (authorData) {
          setAuthor(authorData);
        }
      }
      
      // Get likes count
      const likes = postService.getPostLikesCount(currentPost.id);
      setLikesCount(likes);
      
      // Check if current user liked this post
      if (isAuthenticated && currentUser) {
        const hasLiked = postService.hasUserLikedPost(currentUser.id, currentPost.id);
        setIsLiked(hasLiked);
      }
    }
  }, [currentPost, users, dispatch, isAuthenticated, currentUser]);
  
  // Update author when users state changes
  useEffect(() => {
    if (currentPost && users.length > 0) {
      const userFromState = users.find(user => user.id === currentPost.authorId);
      if (userFromState) {
        setAuthor(userFromState);
      }
    }
  }, [users, currentPost]);
  
  const handleLikeToggle = () => {
    if (!isAuthenticated || !currentUser || !currentPost) return;
    
    if (isLiked) {
      dispatch(unlikePost({ userId: currentUser.id, postId: currentPost.id }));
      setLikesCount(prev => prev - 1);
      setIsLiked(false);
    } else {
      dispatch(likePost({ userId: currentUser.id, postId: currentPost.id }));
      setLikesCount(prev => prev + 1);
      setIsLiked(true);
    }
  };
  
  const handleDeletePost = () => {
    if (!currentPost) return;
    
    if (window.confirm('Are you sure you want to delete this post?')) {
      dispatch(deletePost(currentPost.id)).then((result) => {
        if (deletePost.fulfilled.match(result)) {
          navigate('/');
        }
      });
    }
  };
  
  if (loading && !currentPost) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading post...</p>
      </div>
    );
  }
  
  if (!currentPost && !loading) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-2">Post Not Found</h2>
        <p className="text-gray-500 mb-4">The post you're looking for could not be found.</p>
        <button
          onClick={() => navigate('/')}
          className="btn btn-primary"
        >
          Go Home
        </button>
      </div>
    );
  }
  
  const isAuthor = currentUser && currentPost && currentUser.id === currentPost.authorId;
  
  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-start mb-4 animate-fade-in">
          <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {currentPost && (
        <article className="animate-fade-in">
          <h1 className="text-3xl font-bold mb-4">{currentPost.title}</h1>
          
          <div className="flex items-center mb-6">
            {author && (
              <Link to={`/profile/${author.id}`} className="flex items-center">
                <div className="avatar mr-3">
                  {author.profilePicture ? (
                    <img 
                      src={author.profilePicture} 
                      alt={author.username} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                      {author.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-medium">{author.username}</div>
                  <div className="text-sm text-gray-500">
                    {currentPost.createdAt && formatDistanceToNow(new Date(currentPost.createdAt), { addSuffix: true })}
                  </div>
                </div>
              </Link>
            )}
            
            {isAuthor && (
              <div className="ml-auto flex space-x-2">
                <Link
                  to={`/edit/${currentPost.id}`}
                  className="btn btn-ghost flex items-center"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Link>
                <button
                  onClick={handleDeletePost}
                  className="btn btn-ghost text-red-600 flex items-center"
                >
                  <Trash className="w-4 h-4 mr-1" />
                  Delete
                </button>
              </div>
            )}
          </div>
          
          <div className="card mb-8">
            <p className="text-gray-800 whitespace-pre-line">{currentPost.content}</p>
            
            <div className="flex items-center mt-6 pt-4 border-t border-gray-100">
              <button 
                onClick={handleLikeToggle}
                disabled={!isAuthenticated}
                className={`flex items-center ${
                  isLiked 
                    ? 'text-accent-500' 
                    : 'text-gray-500 hover:text-accent-500'
                } transition-colors mr-4`}
              >
                <Heart className={`w-5 h-5 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                <span>{likesCount} like{likesCount !== 1 ? 's' : ''}</span>
              </button>
              
              <div className="flex items-center text-gray-500">
                <MessageCircle className="w-5 h-5 mr-1" />
                Comments
              </div>
            </div>
          </div>
          
          <CommentSection postId={currentPost.id} />
        </article>
      )}
    </div>
  );
};

export default PostDetail;