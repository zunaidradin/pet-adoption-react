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

  const [foodItems, setFoodItems] = useState([]);

  const [cart, setCart] = useState([]);

  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'; // Check if logged in
  const username = JSON.parse(localStorage.getItem('user'))?.username; // Get the logged-in user's name

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    // Fetch pets from backend
    fetch('http://localhost:5000/api/pets')
      .then(res => res.json())
      .then(data => {
        console.log('Fetched pets:', data); // Debug log
        setPets(data);
      })
      .catch(err => console.error('Error fetching pets:', err));
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    // Fetch pet food from backend
    fetch('http://localhost:5000/api/pet_food')
      .then(res => res.json())
      .then(data => {
        console.log('Fetched pet food:', data); // Debug log
        setFoodItems(data);
      })
      .catch(err => console.error('Error fetching pet food:', err));
  }, []);

  // Fetch cart items when component mounts
  useEffect(() => {
    if (isLoggedIn) {
      fetchCartItems();
    }
  }, [isLoggedIn]);

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
  const handleAddToCart = async (foodItem) => {
    try {
      const userId = JSON.parse(localStorage.getItem('user'))?.id || 'guest';
      const response = await fetch('http://localhost:5000/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          productId: foodItem.id,
          productType: 'pet_food',
          price: foodItem.price
        }),
      });

      if (response.ok) {
        // Fetch updated cart after adding item
        fetchCartItems();
        alert('Item added to cart!');
      } else {
        console.error('Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  // Fetch cart items
  const fetchCartItems = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem('user'))?.id || 'guest';
      const response = await fetch(`http://localhost:5000/api/cart?userId=${userId}`);
      const data = await response.json();
      setCart(data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  // Handle removing item from cart
  const handleRemoveFromCart = async (itemId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/cart/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchCartItems(); // Refresh cart after removal
      } else {
        console.error('Failed to remove from cart');
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
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
              {cart.map((item) => (
                <li key={item.id}>
                  {item.product_type === 'pet_food' && foodItems.find(f => f.id === item.product_id)?.name} 
                  - ${item.price}
                  <button 
                    onClick={() => handleRemoveFromCart(item.id)}
                    className="remove-from-cart"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <div className="cart-total">
              <p><strong>Total: </strong>${cart.reduce((sum, item) => sum + Number(item.price), 0).toFixed(2)}</p>
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
