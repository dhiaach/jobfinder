import React, { useState, useEffect } from "react";
import { FaUserCircle, FaComments } from "react-icons/fa"; // Changed FaBell to FaComments
import { FiLogIn, FiUserPlus, FiLogOut } from "react-icons/fi";
import { MdWork } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import LoginModal from "./LoginModal";
import SignUpModal from "./SignUpModal";
import "./Headertwo.css";

const HeaderTwo = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.account-dropdown')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) setIsDropdownOpen(false);
  }, [user]);

  // Function to handle chat navigation
  const handleChatClick = () => {
    if (user) {
      navigate('/chats'); // Navigate to general chat page
    } else {
      setIsLoginModalOpen(true); // Show login if not authenticated
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <MdWork className="logo-icon" />
          <span>JobFinder</span>
        </div>
        <nav className="main-nav">
          <Link to="/post-job" className="nav-link">Post a Job</Link>
         <Link to="/my-posts" className="nav-link">My Job Posts</Link>
         <Link to="/saved-posts" className="nav-link">My saved posts</Link>
        </nav>
      </div>

      <div className="header-right">
        <button className="notification-btn" onClick={handleChatClick}>
          <FaComments />
        </button>
        
        <div className="account-dropdown">
          <button 
            className="account-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsDropdownOpen(!isDropdownOpen);
            }}
          >
            <FaUserCircle />
            <span>{user ? (profile?.name || user.email) : "Account"}</span>
          </button>
          
          {isDropdownOpen && (
            <div className="dropdown-menu">
              {user ? (
                <button 
                  className="dropdown-item"
                  onClick={() => {
                    signOut();
                    setIsDropdownOpen(false);
                  }}
                >
                  <FiLogOut />
                  <span>Logout</span>
                </button>
              ) : (
                <>
                  <button 
                    className="dropdown-item"
                    onClick={() => {
                      setIsLoginModalOpen(true);
                      setIsDropdownOpen(false);
                    }}
                  >
                    <FiLogIn />
                    <span>Login</span>
                  </button>
                  <button 
                    className="dropdown-item"
                    onClick={() => {
                      setIsSignUpModalOpen(true);
                      setIsDropdownOpen(false);
                    }}
                  >
                    <FiUserPlus />
                    <span>Sign Up</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {isLoginModalOpen && (
        <LoginModal 
          onClose={() => setIsLoginModalOpen(false)}
          onSuccess={() => navigate('/')}
        />
      )}

      {isSignUpModalOpen && (
        <SignUpModal 
          onClose={() => setIsSignUpModalOpen(false)}
          onSuccess={() => navigate('/')}
        />
      )}
    </header>
  );
};

export default HeaderTwo;