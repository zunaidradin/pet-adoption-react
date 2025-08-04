import React, { useState } from 'react';
import './AdoptPet.css';

const AdoptPet = ({ petId }) => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate a POST request to submit the application
    console.log(`Adoption application submitted for pet ID: ${petId}`);
    console.log(`Applicant's Name: ${name}`);
    console.log(`Message: ${message}`);
  };

  return (
    <form onSubmit={handleSubmit} className="adopt-form">
      <div>
        <label>Your Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Why do you want to adopt this pet?</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        ></textarea>
      </div>
      <button type="submit">Submit Application</button>
    </form>
  );
};

export default AdoptPet;
