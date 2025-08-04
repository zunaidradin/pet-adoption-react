import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './PetDetail.css'; // Pet detail page styling

const PetDetail = () => {
  const { id } = useParams(); // Get the pet ID from the URL
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);

  useEffect(() => {
    // Normally, you would fetch this data from an API, but since it's mock data:
    const pets = [
      { 
        id: 1, 
        name: 'Bella', 
        age: '3 years', 
        breed: 'Golden Retriever', 
        type: 'Dog', 
        status: 'Available', 
        image: '/images/dog-image.jpg', 
        description: 'A friendly and loyal dog who loves to play fetch and enjoy the outdoors.' 
      },
      { 
        id: 2, 
        name: 'Mittens', 
        age: '2 years', 
        breed: 'Tabby', 
        type: 'Cat', 
        status: 'Adopted', 
        image: '/images/cat-image.jpg', 
        description: 'A playful and curious cat who loves to nap in sunny spots and chase toys.' 
      },
      { 
        id: 3, 
        name: 'Tweety', 
        age: '1 year', 
        breed: 'Canary', 
        type: 'Bird', 
        status: 'Available', 
        image: '/images/bird-image.jpg', 
        description: 'A cheerful and energetic bird with a beautiful yellow color and melodic songs.' 
      },
      { 
        id: 4, 
        name: 'Bunny', 
        age: '2 years', 
        breed: 'Angora', 
        type: 'Rabbit', 
        status: 'Available', 
        image: '/images/rabbit-image.jpg', 
        description: 'A soft and fluffy rabbit who enjoys nibbling on fresh veggies and hopping around the garden.' 
      },
    ];

    // Find the pet that matches the ID from the URL
    const selectedPet = pets.find((pet) => pet.id === parseInt(id));
    if (selectedPet) {
      setPet(selectedPet);
    } else {
      navigate('/'); // Redirect to home page if pet is not found
    }
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
