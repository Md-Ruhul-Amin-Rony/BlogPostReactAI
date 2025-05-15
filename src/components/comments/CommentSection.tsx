import { useState, FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { User, MessageSquare } from 'lucide-react';
import { AppDispatch, RootState } from '../../app/store';
import { createComment } from '../../features/comments/commentSlice';
import CommentItem from './CommentItem';

interface CommentSectionProps {
  postId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { comments, loading } = useSelector((state: RootState) => state.comments);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [content, setContent] = useState('');
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user || !content.trim()) return;
    
    dispatch(
      createComment({
        content: content.trim(),
        authorId: user.id,
        postId,
      })
    );
    
    setContent('');
  };
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <MessageSquare className="w-5 h-5 mr-2" />
        Comments
      </h2>
      
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex">
            <div className="mr-3 flex-shrink-0">
              <div className="avatar">
                {user?.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt={user.username} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-gray-500" />
                )}
              </div>
            </div>
            <div className="flex-grow">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Add a comment..."
                className="textarea mb-2"
                required
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!content.trim() || loading}
                >
                  {loading ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 p-4 rounded-lg mb-6 text-center">
          <p className="text-gray-600 mb-2">Sign in to leave a comment</p>
          <a href="/login" className="btn btn-secondary">
            Sign In
          </a>
        </div>
      )}
      
      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        ) : (
          <p className="text-center text-gray-500 py-4">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
};

export default CommentSection;