import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Logout.css'; // Import the CSS file for styling

const Logout = () => {
  const navigate = useNavigate();

  // Handle logout by clearing localStorage and redirecting to login page
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn'); // Remove login state
    localStorage.removeItem('isAdmin');    // Remove admin state (if applicable)
    navigate('/login'); // Redirect to the login page after logout
  };

  return (
    <button onClick={handleLogout} className="logout-btn">
      Logout
    </button>
  );
};

export default Logout;
