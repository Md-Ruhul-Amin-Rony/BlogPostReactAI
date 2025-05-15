import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, MoreHorizontal, Trash, Edit } from 'lucide-react';
import { Post, User } from '../../types';
import { RootState, AppDispatch } from '../../app/store';
import { fetchUserById } from '../../features/users/userSlice';
import { likePost, unlikePost, deletePost } from '../../features/posts/postSlice';
import userService from '../../services/userService';
import postService from '../../services/postService';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user: currentUser } = useSelector((state: RootState) => state.auth);
  const { users } = useSelector((state: RootState) => state.users);
  
  const [author, setAuthor] = useState<Omit<User, 'password'> | null>(null);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    const fetchAuthor = async () => {
      const foundUser = users.find(u => u.id === post.authorId);
      if (foundUser) {
        setAuthor(foundUser);
      } else {
        const fetchedUser = await userService.getUserById(post.authorId);
        if (fetchedUser) {
          setAuthor(fetchedUser);
          dispatch(fetchUserById(post.authorId));
        }
      }
    };

    fetchAuthor();
    
    // Get likes count
    const likes = postService.getPostLikesCount(post.id);
    setLikesCount(likes);
    
    // Check if current user liked this post
    if (isAuthenticated && currentUser) {
      const hasLiked = postService.hasUserLikedPost(currentUser.id, post.id);
      setIsLiked(hasLiked);
    }
    
    // Get comments count
    const comments = postService.getCommentsByPostId(post.id).length;
    setCommentsCount(comments);
  }, [post, users, dispatch, isAuthenticated, currentUser]);

  const handleLikeToggle = () => {
    if (!isAuthenticated || !currentUser) return;
    
    if (isLiked) {
      dispatch(unlikePost({ userId: currentUser.id, postId: post.id }));
      setLikesCount(prev => prev - 1);
      setIsLiked(false);
    } else {
      dispatch(likePost({ userId: currentUser.id, postId: post.id }));
      setLikesCount(prev => prev + 1);
      setIsLiked(true);
    }
  };
  
  const handleDeletePost = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      dispatch(deletePost(post.id));
    }
    setShowOptions(false);
  };

  const isAuthor = currentUser && currentUser.id === post.authorId;
  
  // Extract snippet from content (first 150 chars)
  const contentSnippet = post.content.length > 150 
    ? `${post.content.substring(0, 150)}...` 
    : post.content;

  return (
    <article className="card transition-all hover:shadow-md animate-fade-in">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <Link to={`/profile/${post.authorId}`} className="mr-3">
            <div className="avatar">
              {author?.profilePicture ? (
                <img 
                  src={author.profilePicture} 
                  alt={author.username} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                  {author?.username?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </Link>
          <div>
            <Link 
              to={`/profile/${post.authorId}`}
              className="font-medium text-gray-900 hover:text-primary-600"
            >
              {author?.username || 'Unknown User'}
            </Link>
            <p className="text-xs text-gray-500">
              {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : 'some time ago'}
            </p>
          </div>
        </div>
        
        {isAuthor && (
          <div className="relative">
            <button 
              onClick={() => setShowOptions(!showOptions)}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            
            {showOptions && (
              <div className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg z-10 animate-fade-in">
                <Link 
                  to={`/edit/${post.id}`}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Post
                </Link>
                <button 
                  onClick={handleDeletePost}
                  className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                >
                  <Trash className="w-4 h-4 mr-2" />
                  Delete Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      <Link to={`/post/${post.id}`} className="block">
        <h2 className="text-xl font-semibold mb-2 hover:text-primary-600 transition-colors">
          {post.title}
        </h2>
        <p className="text-gray-700 mb-4">{contentSnippet}</p>
      </Link>
      
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <button 
          onClick={handleLikeToggle}
          disabled={!isAuthenticated}
          className={`flex items-center ${
            isLiked 
              ? 'text-accent-500' 
              : 'text-gray-500 hover:text-accent-500'
          } transition-colors`}
        >
          <Heart className={`w-5 h-5 mr-1 ${isLiked ? 'fill-current' : ''}`} />
          <span>{likesCount}</span>
        </button>
        
        <Link 
          to={`/post/${post.id}`}
          className="flex items-center text-gray-500 hover:text-primary-600 transition-colors"
        >
          <MessageCircle className="w-5 h-5 mr-1" />
          <span>{commentsCount}</span>
        </Link>
      </div>
    </article>
  );
};

export default PostCard;