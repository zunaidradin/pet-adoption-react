import React, { useState } from 'react';
import './AddPetForm.css'; // You can add CSS for better styling

const AddPetForm = () => {
  // State hooks for each form field
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [type, setType] = useState('');
  const [age, setAge] = useState('');
  const [status, setStatus] = useState('Available');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Simulate sending data to the backend (e.g., via an API)
    console.log('New Pet Added:', {
      name,
      breed,
      type,
      age,
      status,
      description,
      image,
    });

    // Optionally, reset the form after submission
    setName('');
    setBreed('');
    setType('');
    setAge('');
    setStatus('Available');
    setDescription('');
    setImage('');
  };

  return (
    <form onSubmit={handleSubmit} className="add-pet-form">
      <h2>Add New Pet</h2>
      
      <div>
        <label>Pet Name</label>
        <input 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />
      </div>

      <div>
        <label>Breed</label>
        <input 
          type="text" 
          value={breed} 
          onChange={(e) => setBreed(e.target.value)} 
          required 
        />
      </div>

      <div>
        <label>Type (Dog/Cat)</label>
        <input 
          type="text" 
          value={type} 
          onChange={(e) => setType(e.target.value)} 
          required 
        />
      </div>

      <div>
        <label>Age</label>
        <input 
          type="number" 
          value={age} 
          onChange={(e) => setAge(e.target.value)} 
          required 
        />
      </div>

      <div>
        <label>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="Available">Available</option>
          <option value="Adopted">Adopted</option>
        </select>
      </div>

      <div>
        <label>Description</label>
        <textarea 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          required 
        />
      </div>

      <div>
        <label>Image URL</label>
        <input 
          type="text" 
          value={image} 
          onChange={(e) => setImage(e.target.value)} 
          required 
        />
      </div>

      <button type="submit">Add Pet</button>
    </form>
  );
};

export default AddPetForm;
