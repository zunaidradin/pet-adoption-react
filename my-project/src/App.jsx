import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PetList from './PetList'; // Pet List page
import PetDetail from './PetDetail'; // Pet Detail page
import Login from './Login'; // Login page
import Registration from './Registration'; // Registration page

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} /> {/* Login Page */}
        <Route path="/register" element={<Registration />} /> {/* Registration Page */}
        <Route path="/" element={<PetList />} /> {/* Pet List Page */}
        <Route path="/pet/:id" element={<PetDetail />} /> {/* Pet Detail Page */}
      </Routes>
    </Router>
  );
};

export default App;
