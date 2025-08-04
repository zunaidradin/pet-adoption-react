import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './PetList.css'; // Ensure your PetList CSS is imported
import Logout from './LogOut'; // Import the Logout component

const PetList = () => {
  const [pets, setPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [filter, setFilter] = useState({
    breed: '',
    age: '',
    type: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');

  const [foodItems, setFoodItems] = useState([
    { id: 1, name: 'Dog Food', price: 20, image: '/images/dog-food.jpg' }, // Dog Food Image
    { id: 2, name: 'Cat Food', price: 15, image: '/images/cat-food.jpg' }, // Cat Food Image
    { id: 3, name: 'Bird Food', price: 10, image: '/images/bird-food.jpg' }, // Bird Food Image
    { id: 4, name: 'Rabbit Food', price: 12, image: '/images/rabbit-food.jpg' }, // Rabbit Food Image
  ]);

  const [cart, setCart] = useState([]);

  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'; // Check if logged in
  const username = JSON.parse(localStorage.getItem('user'))?.username; // Get the logged-in user's name

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login'); // Redirect to login if not logged in
    }

    // Add pets with details (mock data)
    const mockPets = [
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

    setPets(mockPets);
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    // Filter and search pets
    let filtered = pets.filter((pet) => {
      const matchesBreed = filter.breed ? pet.breed === filter.breed : true;
      const matchesAge = filter.age ? pet.age === filter.age : true;
      const matchesType = filter.type ? pet.type === filter.type : true;
      const matchesSearch = pet.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesBreed && matchesAge && matchesType && matchesSearch;
    });

    // Sort pets based on selected sort option
    if (sortBy === 'name') {
      filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'age') {
      filtered = filtered.sort((a, b) => a.age.localeCompare(b.age));
    }

    setFilteredPets(filtered);
  }, [filter, pets, searchQuery, sortBy]);

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prevFilter) => ({
      ...prevFilter,
      [name]: value,
    }));
  };

  // Handle search query change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle sorting
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  // Handle adding food to cart
  const handleAddToCart = (foodItem) => {
    setCart((prevCart) => [...prevCart, foodItem]);
  };

  // Calculate total cart value
  const calculateTotal = () => {
    return cart.reduce((total, food) => total + food.price, 0).toFixed(2);
  };

  return (
    <div className="pet-list">
      {/* Header: Display logged-in user's name and the logout button */}
      <div className="header">
        <span className="user-name">Welcome, {username}</span>
        <Logout /> {/* Render the Logout button */}
      </div>

      {/* Show the "Add New Pet" button for all logged-in users */}
      {isLoggedIn && (
        <div className="add-pet-btn-container">
          <Link to="/admin/add-pet">
            <button className="add-pet-btn">Add New Pet</button>
          </Link>
        </div>
      )}

      {/* Filter and Search Section */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search by name"
          value={searchQuery}
          onChange={handleSearchChange}
        />

        <select name="type" onChange={handleFilterChange} value={filter.type}>
          <option value="">Select Animal Type</option>
          <option value="Dog">Dog</option>
          <option value="Cat">Cat</option>
          <option value="Bird">Bird</option>
          <option value="Rabbit">Rabbit</option>
        </select>

        <select name="breed" onChange={handleFilterChange} value={filter.breed}>
          <option value="">Select Breed</option>
          <option value="Golden Retriever">Golden Retriever</option>
          <option value="Tabby">Tabby</option>
          <option value="Canary">Canary</option>
          <option value="Angora">Angora</option>
        </select>

        <select name="age" onChange={handleFilterChange} value={filter.age}>
          <option value="">Select Age</option>
          <option value="3 years">3 years</option>
          <option value="2 years">2 years</option>
          <option value="1 year">1 year</option>
        </select>

        <select name="sort" onChange={handleSortChange} value={sortBy}>
          <option value="name">Sort by Name</option>
          <option value="age">Sort by Age</option>
        </select>
      </div>

      {/* Pet List heading */}
      <h1>Available Pets for Adoption</h1>

      {/* Pet cards display (side by side) */}
      <div className="pet-cards-container">
        {filteredPets.map((pet) => (
          <div key={pet.id} className="pet-card">
            <Link to={`/pet/${pet.id}`} className="pet-card-link">
              <img src={pet.image} alt={pet.name} />
              <h2>{pet.name}</h2>
              <p>{pet.status}</p>
            </Link>
          </div>
        ))}
      </div>

      {/* Pet Food Section */}
      <h2>Pet Food</h2>
      <div className="pet-food-container">
        {foodItems.map((food) => (
          <div key={food.id} className="pet-food-item">
            <img src={food.image} alt={food.name} className="food-image" />
            <h3>{food.name}</h3>
            <p>${food.price}</p>
            <button className="add-to-cart-btn" onClick={() => handleAddToCart(food)}>Add to Cart</button>
          </div>
        ))}
      </div>

      {/* Cart Section */}
      
      
      <h2>Your Cart</h2>


      <div className="cart-container">
        {cart.length > 0 ? (
          <>
            <ul>
              {cart.map((food, index) => (
                <li key={index}>
                  {food.name} - ${food.price}
                </li>
              ))}
            </ul>
            <div className="cart-total">
              <p><strong>Total: </strong>${calculateTotal()}</p>
            </div>
          </>
        ) : (
          <p>Your cart is empty!</p>
        )}
      </div>
    </div>
  );
};

export default PetList;
