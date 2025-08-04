import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css'; // Import global CSS

// Import components for different views
import PetList from './components/PetList';
import PetDetail from './components/PetDetail';
import AdoptPet from './components/AdoptPet';
import AddPetForm from './components/AddPetForm';
import Login from './components/Login'; // Login page component
import Registration from './components/Registration'; // Registration page component

const App = () => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'; // Check if the user is logged in

  return (
    <Router>
      <Routes>
        {/* Redirect to login page if not logged in */}
        <Route path="/" element={isLoggedIn ? <PetList /> : <Navigate to="/login" />} />

        {/* Login and Registration Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />

        {/* Route for displaying details of a specific pet */}
        <Route path="/pet/:id" element={<PetDetail />} />

        {/* Route for the adoption application form */}
        <Route path="/adopt/:id" element={<AdoptPet />} />

        {/* Admin Route for adding new pets (only if logged in as admin) */}
        {isLoggedIn && <Route path="/admin/add-pet" element={<AddPetForm />} />}
      </Routes>
    </Router>
  );
};

createRoot(document.getElementById('root')).render(<App />);
