import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../app/store';
import { register, clearError } from '../features/auth/authSlice';
import { UserPlus, AlertCircle, Upload } from 'lucide-react';

const Register = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: '',
    profilePicture: '',
  });

  const [formErrors, setFormErrors] = useState({
    password: '',
    confirmPassword: '',
  });

  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);

  if (isAuthenticated) {
    navigate('/');
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear errors when typing
    if (error) {
      dispatch(clearError());
    }
    
    if (name === 'password' || name === 'confirmPassword') {
      validatePasswords(name, value);
    }
  };

  const validatePasswords = (field: string, value: string) => {
    const { password, confirmPassword } = formData;
    const updatedValue = field === 'password' ? value : password;
    const updatedConfirmValue = field === 'confirmPassword' ? value : confirmPassword;
    
    let errors = { ...formErrors };
    
    if (updatedValue && updatedValue.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    } else {
      errors.password = '';
    }
    
    if (updatedConfirmValue && updatedValue !== updatedConfirmValue) {
      errors.confirmPassword = 'Passwords do not match';
    } else {
      errors.confirmPassword = '';
    }
    
    setFormErrors(errors);
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Create a temporary URL for preview
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const result = reader.result as string;
        setProfilePicturePreview(result);
        setFormData({
          ...formData,
          profilePicture: result,
        });
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const { username, email, password, confirmPassword, bio, profilePicture } = formData;
    
    // Validate form
    if (password !== confirmPassword) {
      return setFormErrors({
        ...formErrors,
        confirmPassword: 'Passwords do not match',
      });
    }
    
    if (password.length < 6) {
      return setFormErrors({
        ...formErrors,
        password: 'Password must be at least 6 characters',
      });
    }
    
    // In a real app, we'd handle the profile picture upload to a storage service
    // For this demo, we'll just use a placeholder if no image is selected
    const defaultProfilePicture = 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg';
    
    dispatch(
      register({
        username,
        email,
        password,
        bio,
        profilePicture: profilePicture || defaultProfilePicture,
      })
    );
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Create an Account</h1>
        <p className="text-gray-600">Join the BlogSocial community</p>
      </div>
      
      <div className="card">
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-start mb-4 animate-fade-in">
              <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          <div className="mb-6 flex flex-col items-center">
            <div className="relative mb-2">
              <div className="avatar-xl overflow-hidden border-2 border-white shadow-sm">
                {profilePicturePreview ? (
                  <img 
                    src={profilePicturePreview} 
                    alt="Profile preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                    <UserPlus className="w-8 h-8" />
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
            <label className="text-sm text-gray-600">
              Upload profile picture
            </label>
          </div>
          
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="johndoe"
              className="input"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className="input"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={`input ${formErrors.password ? 'border-red-500' : ''}`}
              required
            />
            {formErrors.password && (
              <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className={`input ${formErrors.confirmPassword ? 'border-red-500' : ''}`}
              required
            />
            {formErrors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{formErrors.confirmPassword}</p>
            )}
          </div>
          
          <div className="mb-6">
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
              Bio (optional)
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself..."
              className="textarea"
            />
          </div>
          
          <button
            type="submit"
            className="btn btn-primary w-full flex justify-center items-center"
            disabled={loading}
          >
            {loading ? (
              <span className="loader"></span>
            ) : (
              <>
                <UserPlus className="w-5 h-5 mr-1" />
                Create Account
              </>
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;