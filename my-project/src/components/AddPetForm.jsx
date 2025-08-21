// src/components/AddPetForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import './AddPetForm.css';

const AddPetForm = () => {
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [animalType, setAnimalType] = useState('Dog');
  const [age, setAge] = useState(''); // numeric input; saved as "<n> years"
  const [status, setStatus] = useState('Available');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const fileInputRef = useRef(null);

  // Revoke object URLs on change/unmount to avoid leaks
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;

    // Revoke previous preview URL (if any) before creating a new one
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setImageFile(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');

    if (submitting) return; // guard against double-clicks

    // Basic front-end validation
    if (!name.trim() || !breed.trim() || age === '' || Number(age) < 0) {
      setMsg('Please fill in name, breed, and a valid non-negative age.');
      return;
    }
    if (!imageFile) {
      setMsg('Please choose a photo to upload.');
      return;
    }

    setSubmitting(true);
    try {
      const cleanAge = String(age).trim();
      const ageToSave = /^\d+$/.test(cleanAge) ? `${cleanAge} years` : cleanAge;

      const fd = new FormData();
      fd.append('name', name.trim());
      fd.append('animalType', animalType);
      fd.append('breed', breed.trim());
      fd.append('age', ageToSave);
      fd.append('status', status);
      fd.append('description', description.trim());
      fd.append('image', imageFile); // field name must be "image"

      const res = await fetch('/api/pets', { method: 'POST', body: fd });

      // Try to read JSON, but don't explode if server returns empty body
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errText = data?.error || data?.message || 'Failed to add pet.';
        throw new Error(errText);
      }

      setMsg('✅ Pet added successfully!');

      // Reset all fields
      setName('');
      setBreed('');
      setAnimalType('Dog');
      setAge('');
      setStatus('Available');
      setDescription('');
      setImageFile(null);

      // Clear and revoke preview
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');

      // Clear the file input element itself so it looks reset in the UI
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setMsg(`❌ ${err.message || 'Something went wrong.'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-pet-form" encType="multipart/form-data">
      <h2>Add New Pet</h2>

      <div>
        <label>Pet Name</label>
        <input
          type="text"
          value={name}
          placeholder="Bella"
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Breed</label>
        <input
          type="text"
          value={breed}
          placeholder="Golden Retriever"
          onChange={(e) => setBreed(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Type (Dog/Cat) — also others</label>
        <select value={animalType} onChange={(e) => setAnimalType(e.target.value)} required>
          <option value="Dog">Dog</option>
          <option value="Cat">Cat</option>
          <option value="Bird">Bird</option>
          <option value="Rabbit">Rabbit</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label>Age</label>
        <input
          type="number"
          min="0"
          value={age}
          placeholder="3"
          onChange={(e) => setAge(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} required>
          <option value="Available">Available</option>
          <option value="Adopted">Adopted</option>
        </select>
      </div>

      <div>
        <label>Description</label>
        <textarea
          value={description}
          placeholder="Friendly and playful..."
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <label>Upload Photo</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          required
          className="file-input"
          ref={fileInputRef}
        />
        {previewUrl && (
          <div className="preview-wrap">
            <img src={previewUrl} alt="Preview" className="preview-image" />
          </div>
        )}
      </div>

      <button type="submit" disabled={submitting}>
        {submitting ? 'Adding…' : 'Add Pet'}
      </button>

      {msg && <p className="form-msg">{msg}</p>}
    </form>
  );
};

export default AddPetForm;
