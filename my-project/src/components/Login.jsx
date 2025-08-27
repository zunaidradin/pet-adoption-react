import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ identifier: username, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Login failed');
        return;
      }
      localStorage.setItem('auth_user', JSON.stringify({ id: data.id, username: data.username, displayName: data.username, email: data.email }));
      localStorage.setItem('isLoggedIn', 'true');
      navigate('/');
    } catch (err) {
      setErrorMessage('Network error');
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
