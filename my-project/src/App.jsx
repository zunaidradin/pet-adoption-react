import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// Corrected import paths to point to components folder
import PetList from './components/PetList.jsx';
import PetDetail from './components/PetDetail.jsx';
import Login from './components/Login.jsx';
import Registration from './components/Registration.jsx';
import Payment from './components/Payment.jsx';
import Donation from './components/Donation.jsx';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} /> {/* Login Page */}
        <Route path="/register" element={<Registration />} /> {/* Registration Page */}
        <Route path="/" element={<PetList />} /> {/* Pet List Page */}
  <Route path="/pet/:id" element={<PetDetail />} />
  <Route path="/payment" element={<Payment />} />
  <Route path="/donation" element={<Donation />} />
      </Routes>
    </Router>
  );
};

export default App;
