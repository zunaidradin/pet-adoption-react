import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Registration.css'; // Import the custom CSS for the registration page

const Registration = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate(); // React Router hook for navigation

  const handleSubmit = (e) => {
    e.preventDefault();

    // Ensure both username and password are entered
    if (username && password) {
      // Save the user data to localStorage (simulate registration)
      localStorage.setItem('user', JSON.stringify({ username, password }));

      setSuccess('User registered successfully!');
      setError('');
      
      // Redirect back to login page after successful registration
      setTimeout(() => navigate('/login'), 2000); // Redirect to login page after 2 seconds
    } else {
      setError('Please fill in both fields.');
    }
  };

  return (
    <div className="registration-container">
      <div className="registration-box">
        <h2>Create an Account</h2>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        <form onSubmit={handleSubmit}>
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
          <button type="submit" className="register-btn">Register</button>
        </form>
        <p>Already have an account? <span className="login-link" onClick={() => navigate('/login')}>Login here</span></p>
      </div>
    </div>
  );
};

export default Registration;
