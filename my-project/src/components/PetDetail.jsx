import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './PetDetail.css'; // Pet detail page styling

const PetDetail = () => {
  const { id } = useParams(); // Get the pet ID from the URL
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/pets');
        const data = await res.json();
        if (!Array.isArray(data)) return;
        const selected = data.find(p => String(p.id) === String(id));
        if (!cancelled) {
          if (selected) setPet(selected); else navigate('/');
        }
      } catch (e) {
        console.error('Failed to load pet detail', e);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [id, navigate]);

  if (!pet) return <div>Loading...</div>;

  return (
    <div className="pet-detail">
      <button onClick={() => navigate('/')} className="back-btn">Back to Pet List</button>
      <div className="pet-detail-card">
  <img src={pet.image} alt={pet.name} className="pet-detail-image" />
        <h2>{pet.name}</h2>
        <table className="pet-info-table">
          <tbody>
            <tr>
              <td><strong>Age:</strong></td>
              <td>{pet.age}</td>
            </tr>
            <tr>
              <td><strong>Breed:</strong></td>
              <td>{pet.breed}</td>
            </tr>
            <tr>
              <td><strong>Type:</strong></td>
              <td>{pet.type}</td>
            </tr>
            <tr>
              <td><strong>Status:</strong></td>
              <td>{pet.status}</td>
            </tr>
            <tr>
              <td><strong>Description:</strong></td>
              <td>{pet.description}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PetDetail;
