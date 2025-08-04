import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Import the custom CSS for the login page

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate(); // React Router hook for navigation

  useEffect(() => {
    // If the user is already logged in, redirect them to the Pet List page
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
      navigate('/'); // Redirect to the Pet List page if already logged in
    }
  }, [navigate]); // Run this effect when the component mounts

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Retrieve stored user data from localStorage
    const storedUser = JSON.parse(localStorage.getItem('user'));
    
    // Check if user credentials match
    if (storedUser && username === storedUser.username && password === storedUser.password) {
      localStorage.setItem('isLoggedIn', 'true'); // Set login status
      navigate('/'); // Redirect to the Pet List page
    } else {
      setErrorMessage('Invalid username or password');
    }
  };

  const navigateToRegister = () => {
    navigate('/register'); // Navigate to the registration page
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <button type="submit" className="login-btn">Login</button>
        </form>
        <p>Don't have an account? <span className="register-link" onClick={navigateToRegister}>Register here</span></p>
      </div>
    </div>
  );
};

export default Login;
