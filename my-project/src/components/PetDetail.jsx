import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './PetDetail.css'; // Pet detail page styling

const PetDetail = () => {
  const { id } = useParams(); // Get the pet ID from the URL
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/pets/${id}`);
        if (!res.ok) {
          navigate('/');
          return;
        }
        const data = await res.json();
        if (!cancelled) setPet(data);
      } catch (e) {
        console.error('Failed to load pet detail', e);
      }
    })();
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
              <td><strong>Type:</strong></td>
              <td>{pet.animalType || pet.type || '—'}</td>
            </tr>
            <tr>
              <td><strong>Status:</strong></td>
              <td>{pet.status}</td>
            </tr>
            <tr>
              <td><strong>Description:</strong></td>
              <td>{pet.description}</td>
            </tr>
            <tr>
              <td><strong>Address:</strong></td>
              <td>{pet.address || '—'}</td>
            </tr>
            <tr>
              <td><strong>Contact:</strong></td>
              <td>{pet.contactNumber || '—'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PetDetail;
