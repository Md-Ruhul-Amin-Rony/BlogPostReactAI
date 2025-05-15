import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import { Trash, User } from 'lucide-react';
import { Comment } from '../../types';
import { AppDispatch, RootState } from '../../app/store';
import { deleteComment } from '../../features/comments/commentSlice';
import { fetchUserById } from '../../features/users/userSlice';
import userService from '../../services/userService';

interface CommentItemProps {
  comment: Comment;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const { users } = useSelector((state: RootState) => state.users);
  
  const [author, setAuthor] = useState<any>(null);
  
  useEffect(() => {
    // First check if we already have this user in the Redux store
    const userFromState = users.find(user => user.id === comment.authorId);
    
    if (userFromState) {
      setAuthor(userFromState);
    } else {
      // If not, fetch from the service and dispatch to Redux
      const authorFromService = userService.getUserById(comment.authorId);
      if (authorFromService) {
        setAuthor(authorFromService);
        dispatch(fetchUserById(comment.authorId));
      }
    }
  }, [comment.authorId, users, dispatch]);
  
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      dispatch(deleteComment(comment.id));
    }
  };
  
  const isAuthor = currentUser && comment.authorId === currentUser.id;
  
  return (
    <div className="flex animate-fade-in">
      <div className="mr-3 flex-shrink-0">
        <Link to={`/profile/${comment.authorId}`}>
          <div className="avatar">
            {author?.profilePicture ? (
              <img 
                src={author.profilePicture} 
                alt={author.username} 
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </Link>
      </div>
      <div className="flex-grow bg-gray-50 p-3 rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <Link 
              to={`/profile/${comment.authorId}`}
              className="font-medium text-gray-900 hover:text-primary-600"
            >
              {author?.username || 'Unknown User'}
            </Link>
            <p className="text-xs text-gray-500">
              {comment.createdAt && formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </p>
          </div>
          
          {isAuthor && (
            <button
              onClick={handleDelete}
              className="text-gray-400 hover:text-red-500 p-1"
              aria-label="Delete comment"
            >
              <Trash className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="mt-1 text-gray-700">{comment.content}</p>
      </div>
    </div>
  );
};

export default CommentItem;