import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Menu, X, User, Edit3, LogOut, Home, Users } from 'lucide-react';
import { RootState } from '../../app/store';
import { logout } from '../../features/auth/authSlice';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-primary-600 font-bold text-xl">
              BlogSocial
            </Link>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                isActive 
                  ? "text-primary-600 font-medium" 
                  : "text-gray-600 hover:text-primary-600"
              }
            >
              Home
            </NavLink>
            
            {isAuthenticated ? (
              <>
                <NavLink 
                  to="/create" 
                  className={({ isActive }) => 
                    isActive 
                      ? "text-primary-600 font-medium" 
                      : "text-gray-600 hover:text-primary-600"
                  }
                >
                  Write
                </NavLink>
                
                <div className="relative">
                  <NavLink 
                    to={`/profile/${user?.id}`} 
                    className="flex items-center space-x-2 text-gray-600 hover:text-primary-600"
                  >
                    <div className="avatar w-8 h-8">
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
                    <span>{user?.username}</span>
                  </NavLink>
                </div>
                
                <button 
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-primary-600 flex items-center"
                >
                  <LogOut className="w-5 h-5 mr-1" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink 
                  to="/login" 
                  className={({ isActive }) => 
                    isActive 
                      ? "text-primary-600 font-medium" 
                      : "text-gray-600 hover:text-primary-600"
                  }
                >
                  Login
                </NavLink>
                
                <NavLink 
                  to="/register" 
                  className="btn btn-primary"
                >
                  Sign Up
                </NavLink>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 animate-fade-in">
          <div className="px-4 pt-2 pb-4 space-y-1">
            <NavLink
              to="/"
              className="block py-2 text-gray-600 hover:text-primary-600 flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              <Home className="w-5 h-5 mr-2" />
              Home
            </NavLink>
            
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/create"
                  className="block py-2 text-gray-600 hover:text-primary-600 flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Edit3 className="w-5 h-5 mr-2" />
                  Write
                </NavLink>
                
                <NavLink
                  to={`/profile/${user?.id}`}
                  className="block py-2 text-gray-600 hover:text-primary-600 flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="w-5 h-5 mr-2" />
                  Profile
                </NavLink>
                
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-2 text-gray-600 hover:text-primary-600 flex items-center"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className="block py-2 text-gray-600 hover:text-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </NavLink>
                
                <NavLink
                  to="/register"
                  className="block py-2 btn btn-primary w-full text-center mt-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;