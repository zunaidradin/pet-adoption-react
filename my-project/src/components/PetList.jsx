// src/components/PetList.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './PetList.css';
import Logout from './LogOut';

const PetList = () => {
  // Pets + filters
  const [pets, setPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [filter, setFilter] = useState({ breed: '', age: '', type: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');

  // Food + cart
  const [foodItems, setFoodItems] = useState([]);
  const [cart, setCart] = useState([]);
  const cartTotal = cart.reduce((sum, i) => sum + Number(i.price || 0), 0);
  const cartCount = cart.length;

  const navigate = useNavigate();
  // Prefer new auth_user (API-based) fallback to legacy 'user'
  const authUser = (() => { try { return JSON.parse(localStorage.getItem('auth_user')); } catch { return null; } })();
  const legacyUser = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();
  const effectiveUser = authUser || legacyUser;
  const isLoggedIn = !!effectiveUser;
  const userId = effectiveUser?.id; // must be numeric for cart endpoints
  const username = effectiveUser?.username || effectiveUser?.email || 'User';

  // ---------- Fetch Pets ----------
  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return; }

  fetch('http://localhost:5000/api/pets')
      .then(res => res.json())
      .then(data => setPets(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error fetching pets:', err));
  }, [isLoggedIn, navigate]);

  // ---------- Fetch Food ----------
  useEffect(() => {
    fetch('http://localhost:5000/api/pet_food')
      .then(res => res.json())
      .then(data => setFoodItems(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error fetching pet food:', err));
  }, []);

  // ---------- Fetch Cart ----------
  const fetchCartItems = async () => {
    try {
      // server expects user_id (snake_case) to match your DB columns
  const res = await fetch(`http://localhost:5000/api/cart?userId=${encodeURIComponent(userId)}`);
      if (!res.ok) throw new Error(`GET /api/cart failed (${res.status})`);

      const raw = await res.json();
      // Accept array or wrapped payload
      const items =
        Array.isArray(raw) ? raw :
        Array.isArray(raw.rows) ? raw.rows :
        Array.isArray(raw.data) ? raw.data :
        Array.isArray(raw.cart) ? raw.cart : [];

      // Normalize
      const normalized = items.map(it => ({
        id: it.id,
  user_id: it.user_id ?? it.userId,
  product_id: it.product_id ?? it.productId,
  product_type: it.product_type ?? it.productType,
  quantity: Number(it.quantity ?? 1),
  price: Number(it.price ?? 0), // unit price
      }));

      setCart(normalized);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart([]);
    }
  };

  useEffect(() => { if (isLoggedIn) fetchCartItems(); }, [isLoggedIn]); // load cart on mount/login

  // ---------- Filters / Sorting ----------
  useEffect(() => {
    let filtered = pets.filter((pet) => {
      const matchesBreed = filter.breed ? pet.breed === filter.breed : true;
      const matchesAge = filter.age ? pet.age === filter.age : true;
      const matchesType = filter.type ? pet.type === filter.type : true;
      const matchesSearch = (pet.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesBreed && matchesAge && matchesType && matchesSearch;
    });

    if (sortBy === 'name') filtered = filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    if (sortBy === 'age')  filtered = filtered.sort((a, b) => (a.age || '').localeCompare(b.age || ''));

    setFilteredPets(filtered);
  }, [filter, pets, searchQuery, sortBy]);

  const handleFilterChange = (e) => setFilter(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const handleSortChange = (e) => setSortBy(e.target.value);

  // ---------- Add to Cart ----------
  const handleAddToCart = async (foodItem, { scrollToCart = true } = {}) => {
    if (!userId) { navigate('/login'); return; }
    try {
      const response = await fetch('http://localhost:5000/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Server expects camelCase keys & derives price / increments quantity
        body: JSON.stringify({
          userId: userId,
          productId: foodItem.id,
          productType: 'pet_food'
        })
      });

      if (!response.ok) throw new Error('POST /api/cart failed');
      await fetchCartItems(); // refresh with DB values
       if (scrollToCart) {
         const el = document.getElementById('cart-section');
         if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
       }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  // ---------- Remove from Cart ----------
  const handleRemoveFromCart = async (itemId) => {
    try {
      if (!userId) return;
      const res = await fetch(`http://localhost:5000/api/cart/${itemId}?userId=${encodeURIComponent(userId)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('DELETE /api/cart failed');
      await fetchCartItems();
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  return (
    <div className="pet-list">
      {/* Header */}
      <div className="header">
        <span className="user-name">Welcome, {username}</span>
        <div className="header-actions">
          <button
            type="button"
            className="cart-btn"
            onClick={() => {
              const el = document.getElementById('cart-section');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          >
            {(() => {
              const totalQty = cart.reduce((s,i)=>s + (i.quantity||1),0);
              const totalVal = cart.reduce((s,i)=>s + (i.price * (i.quantity||1)),0);
              return `Your Cart${totalQty ? ` (${totalQty} • $${totalVal.toFixed(2)})` : ''}`;
            })()}
          </button>
          <Logout />
        </div>
      </div>

      {/* Add New Pet */}
      {isLoggedIn && (
        <div className="add-pet-btn-container">
          <Link to="/admin/add-pet">
            <button className="add-pet-btn" type="button">Add New Pet</button>
          </Link>
        </div>
      )}

      {/* Filters */}
  <div className="filters">
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

      {/* Pets */}
      <h1>Available Pets for Adoption</h1>
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

      {/* Food */}
      <h2>Pet Food</h2>
      <div className="pet-food-container">
        {foodItems.map((food) => (
          <div
            key={food.id}
            className="pet-food-item clickable-food"
            role="button"
            tabIndex={0}
            onClick={() => handleAddToCart(food)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleAddToCart(food); } }}
          >
            <img src={food.image} alt={food.name} className="food-image" />
            <h3>{food.name}</h3>
            <p>${Number(food.price).toFixed(2)}</p>
            <small style={{ color: '#666' }}>Click to add</small>
          </div>
        ))}
      </div>

      {/* Cart */}
      <section className="cart-section" id="cart-section">
        <h2>Your Cart</h2>
        {cart.length === 0 ? (
          <div className="cart-empty">Your cart is empty!</div>
        ) : (
          <div className="cart-table-wrapper">
            <table className="cart-table" aria-label="Shopping cart">
              <thead>
                <tr>
                  <th>Item</th>
                  <th className="qty-col">Qty</th>
                  <th>Unit Price</th>
                  <th>Subtotal</th>
                  <th className="action-col">Action</th>
                </tr>
              </thead>
              <tbody>
                {cart.map(item => {
                  const product = item.product_type === 'pet_food'
                    ? foodItems.find(f => String(f.id) === String(item.product_id))
                    : null;
                  const name = product ? product.name : 'Item';
                  const unit = Number(item.price) || 0;
                  const qty = item.quantity || 1;
                  const subtotal = unit * qty;
                  return (
                    <tr key={item.id}>
                      <td data-label="Item">{name}</td>
                      <td data-label="Qty" className="qty-col">{qty}</td>
                      <td data-label="Unit Price">${unit.toFixed(2)}</td>
                      <td data-label="Subtotal">${subtotal.toFixed(2)}</td>
                      <td className="action-col">
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => handleRemoveFromCart(item.id)}
                        >Remove</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" className="total-label">Total</td>
                  <td colSpan="2" className="total-value">${cart.reduce((s,i)=> s + (i.price * (i.quantity||1)),0).toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>
        <div className="checkout-actions">
          <button
            type="button"
            className="checkout-btn"
            onClick={() => navigate('/payment')}
            disabled={cart.length === 0}
          >
            Proceed to Checkout
          </button>
        </div>
    </div>
  );
};

export default PetList;
