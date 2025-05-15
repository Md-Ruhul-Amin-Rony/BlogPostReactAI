import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../app/store';
import { fetchPostById, updatePost, clearCurrentPost } from '../features/posts/postSlice';
import { AlertCircle } from 'lucide-react';

const EditPost = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { currentPost, loading, error } = useSelector((state: RootState) => state.posts);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  
  useEffect(() => {
    if (id) {
      dispatch(fetchPostById(id));
    }
    
    return () => {
      dispatch(clearCurrentPost());
    };
  }, [dispatch, id]);
  
  useEffect(() => {
    if (currentPost) {
      // Redirect if the user is not the author
      if (user?.id !== currentPost.authorId) {
        navigate(`/post/${id}`);
        return;
      }
      
      setFormData({
        title: currentPost.title,
        content: currentPost.content,
      });
    }
  }, [currentPost, user, id, navigate]);
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!id) return;
    
    const { title, content } = formData;
    
    dispatch(
      updatePost({
        id,
        postData: { title, content },
      })
    ).then((result) => {
      if (updatePost.fulfilled.match(result)) {
        navigate(`/post/${id}`);
      }
    });
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
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Edit Post</h1>
        <p className="text-gray-600">Update your post content</p>
      </div>
      
      <div className="card">
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-start mb-4 animate-fade-in">
              <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter a descriptive title"
              className="input"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Write your post content here..."
              className="textarea h-48"
              required
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate(`/post/${id}`)}
              className="btn btn-ghost mr-2"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Update Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPost;