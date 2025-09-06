// src/components/PetList.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Swal from 'sweetalert2';
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
  const username = effectiveUser?.displayName || effectiveUser?.username || effectiveUser?.email || 'User';
  const isAdmin = isLoggedIn && (
    effectiveUser?.username?.toLowerCase?.() === 'admin' ||
    effectiveUser?.is_admin === 1 ||
    effectiveUser?.isAdmin === true
  );

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
      const animalType = pet.animalType || pet.type; // support DB field name
      const matchesBreed = filter.breed ? pet.breed === filter.breed : true;
      const matchesAge = filter.age ? pet.age === filter.age : true;
      const matchesType = filter.type ? animalType === filter.type : true;
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
  const handleAddToCart = async (foodItem, { scrollToCart = true, event } = {}) => {
    if (!userId) { navigate('/login'); return; }

    // ---- Visual feedback animation (fly to cart) ----
    try {
      if (event?.currentTarget && toggleRef.current) {
        const sourceEl = event.currentTarget;
        const imgEl = sourceEl.querySelector('img');
        const cartBtn = toggleRef.current;
        const startRect = (imgEl || sourceEl).getBoundingClientRect();
        const cartRect = cartBtn.getBoundingClientRect();

        // Create clone element
        const clone = document.createElement('div');
        clone.className = 'flying-clone';
        const imgSrc = imgEl?.getAttribute('src');
        if (imgSrc) {
          clone.style.backgroundImage = `url(${imgSrc})`;
        }
        clone.style.position = 'fixed';
        clone.style.left = `${startRect.left + startRect.width / 2}px`;
        clone.style.top = `${startRect.top + startRect.height / 2}px`;
        clone.style.width = `${Math.max(40, startRect.width * 0.4)}px`;
        clone.style.height = `${Math.max(40, startRect.height * 0.4)}px`;
        clone.style.zIndex = '9999';
        document.body.appendChild(clone);

        const endX = cartRect.left + cartRect.width / 2;
        const endY = cartRect.top + cartRect.height / 2;
        const deltaX = endX - (startRect.left + startRect.width / 2);
        const deltaY = endY - (startRect.top + startRect.height / 2);

        // Force style read then animate
        requestAnimationFrame(() => {
          clone.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.2)`;
          clone.style.opacity = '0';
        });

        const removeClone = () => { clone.remove(); };
        clone.addEventListener('transitionend', removeClone, { once: true });

        // Pulse cart after slight delay
        setTimeout(() => {
          cartBtn.classList.add('cart-pulse');
          setTimeout(() => cartBtn.classList.remove('cart-pulse'), 600);
        }, 250);
      }
    } catch {/* ignore animation errors */}

    // ---- Network request (actual add) ----
    try {
      const response = await fetch('http://localhost:5000/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          productId: foodItem.id,
          productType: 'pet_food'
        })
      });

  if (!response.ok) {
        // Try to parse server error
        let msg = 'POST /api/cart failed';
        try { const txt = await response.text(); msg = (JSON.parse(txt)?.error) || msg; } catch {}
        throw new Error(msg);
      }
      await fetchCartItems();
      // Optimistically decrement local stock for this item
      setFoodItems(items => items.map(it => it.id === foodItem.id ? { ...it, stock: Math.max(0, (it.stock ?? 0) - 1) } : it));
      if (scrollToCart) {
        const el = document.getElementById('cart-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (/out of stock/i.test(String(error?.message || ''))) {
        try { await Swal.fire({ icon:'info', title:'Out of stock', text:'Sorry, this item is out of stock.' }); } catch {}
        // Refresh food list to reflect latest stock
        try { const d = await fetch('http://localhost:5000/api/pet_food').then(r=>r.json()); setFoodItems(Array.isArray(d)? d: []); } catch {}
      }
      // Simple error feedback: brief shake
      if (toggleRef.current) {
        toggleRef.current.classList.add('cart-error-shake');
        setTimeout(() => toggleRef.current?.classList.remove('cart-error-shake'), 500);
      }
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

  // --- Hamburger menu state ---
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [darkMode, setDarkMode] = useState(()=> localStorage.getItem('theme') === 'dark');
  const menuRef = useRef(null);
  const toggleRef = useRef(null);
  const [showFilters, setShowFilters] = useState(false);

  const totalQty = cart.reduce((s,i)=>s + (i.quantity||1),0);
  const totalVal = cart.reduce((s,i)=>s + (i.price * (i.quantity||1)),0);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const closeNotif = useCallback(() => setNotifOpen(false), []);

  // Close on outside click
  useEffect(()=>{
  if(!menuOpen) return; 
    const handler = (e)=>{
      if(!menuRef.current) return; 
      if(menuRef.current.contains(e.target) || toggleRef.current?.contains(e.target)) return; 
      closeMenu();
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return ()=>{ document.removeEventListener('mousedown', handler); document.removeEventListener('touchstart', handler); };
  },[menuOpen, closeMenu]);

  // Close on ESC
  useEffect(()=>{
    if(!menuOpen && !notifOpen) return; 
    const handler = (e)=>{ if(e.key==='Escape'){ closeMenu(); closeNotif(); } };
    window.addEventListener('keydown', handler);
    return ()=> window.removeEventListener('keydown', handler);
  },[menuOpen, notifOpen, closeMenu, closeNotif]);

  // Fetch notifications
  const fetchNotifications = useCallback(async ()=>{
    if(!isLoggedIn) return;
    try {
      const res = await fetch('http://localhost:5000/api/admin/me/notifications', { credentials:'include' });
      const data = await res.json();
      if(Array.isArray(data)) {
        setNotifications(data);
        setUnreadCount(data.filter(n=>!n.is_read).length);
      }
    } catch(e){ /* ignore */ }
  },[isLoggedIn]);
  useEffect(()=>{ fetchNotifications(); },[fetchNotifications]);

  const markRead = async (id)=>{
    try { await fetch(`http://localhost:5000/api/admin/me/notifications/${id}/read`, { method:'POST', credentials:'include' }); fetchNotifications(); } catch {}
  };

  const gotoAndClose = (path) => { navigate(path); closeMenu(); };
  const scrollCartAndClose = () => { closeMenu(); const el = document.getElementById('cart-section'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

  const resetFilters = () => {
    setFilter({ breed: '', age: '', type: '' });
    setSortBy('name');
    setSearchQuery('');
  };

  // Apply body class for theme
  useEffect(()=> {
    if(darkMode){ document.body.classList.add('dark-theme'); localStorage.setItem('theme','dark'); }
    else { document.body.classList.remove('dark-theme'); localStorage.setItem('theme','light'); }
  }, [darkMode]);

  return (
    <div className="pet-list themed-transition">
      {/* Header */}
      <div className="header">
        <span className="user-name">Welcome, {username}</span>
        <div className="header-actions">
          <button
            ref={toggleRef}
            type="button"
            aria-haspopup="true"
            aria-expanded={menuOpen}
            aria-controls="primary-menu"
            className={`hamburger-btn ${menuOpen ? 'open' : ''}`}
            onClick={()=> setMenuOpen(o=>!o)}
          >
            <span className="bar" />
            <span className="bar" />
            <span className="bar" />
            {totalQty > 0 && <span className="cart-badge" aria-label={`${totalQty} items in cart`}>{totalQty}</span>}
          </button>
          <button type="button" className="notif-btn" aria-label="Notifications" onClick={()=> setNotifOpen(o=>!o)}>
            🔔{unreadCount>0 && <span className="notif-badge">{unreadCount}</span>}
          </button>
          {notifOpen && (
            <div className="nav-menu-panel notifications-panel" style={{right:'60px'}}>
              <h4 style={{margin:'0 0 10px'}}>Notifications</h4>
              {notifications.length===0 && <p style={{fontSize:'0.75rem',color:'var(--text-secondary)'}}>No notifications.</p>}
              <ul style={{listStyle:'none',padding:0,margin:0,display:'flex',flexDirection:'column',gap:'8px',maxHeight:260,overflowY:'auto'}}>
                {notifications.map(n=> (
                  <li key={n.id} style={{background:'var(--bg-surface)',padding:'8px 10px',border:'1px solid var(--border-color)',borderRadius:8,fontSize:'0.7rem',display:'flex',flexDirection:'column',gap:4}}>
                    <span>{n.message}</span>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <small style={{opacity:.6}}>{n.status}</small>
                      {!n.is_read && <button onClick={()=>markRead(n.id)} style={{background:'var(--accent)',color:'#fff',border:'none',padding:'4px 8px',borderRadius:6,fontSize:'0.6rem',cursor:'pointer'}}>Mark read</button>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {menuOpen && (
            <div ref={menuRef} className="nav-menu-panel" id="primary-menu" role="menu">
              <ul className="nav-menu-list">
                {/* 1. Cart */}
                {!isAdmin && (
                  <li><button type="button" role="menuitem" onClick={()=>gotoAndClose('/cart')} className="menu-link">Cart {totalQty ? <span className="inline-badge">{totalQty} • ${totalVal.toFixed(2)}</span> : '(empty)'}</button></li>
                )}
                {/* 2. Add New Pet (only when logged in) */}
                {isLoggedIn && (
                  <li><button type="button" role="menuitem" onClick={()=>gotoAndClose('/admin/add-pet')} className="menu-link">Add New Pet</button></li>
                )}
                {/* 3. Donate */}
                {!isAdmin && (
                  <li><button type="button" role="menuitem" onClick={()=>gotoAndClose('/donation')} className="menu-link">Donate</button></li>
                )}
                {/* 4. Vet Directory */}
                <li><button type="button" role="menuitem" onClick={()=>gotoAndClose('/vet')} className="menu-link">Vet Directory</button></li>
                {/* 5. Light/Dark Mode toggle as last in requested list */}
                <li>
                  <button type="button" role="menuitem" className="menu-link toggle-theme-btn" onClick={()=> setDarkMode(m=>!m)}>
                    <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                    <span className="inline-badge">{darkMode ? 'ON' : 'OFF'}</span>
                  </button>
                </li>
                {/* Admin Panel + Add Food (if user is admin) */}
                {isLoggedIn && isAdmin && (
                  <>
                    <li><button type="button" role="menuitem" onClick={()=>gotoAndClose('/admin')} className="menu-link">Admin Panel</button></li>
                    <li><button type="button" role="menuitem" onClick={()=>gotoAndClose('/admin/add-food')} className="menu-link">Add New Food</button></li>
                  </>
                )}
                {/* Logout */}
                <li className="logout-wrapper" role="menuitem"><Logout /></li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Add New Pet moved into hamburger menu */}

      <div className="content-layout">
        <div className="filters-toggle-row">
          <button
            type="button"
            className={`filter-toggle-btn ${showFilters ? 'open' : ''}`}
            aria-expanded={showFilters}
            aria-controls="filters-panel"
            onClick={()=> setShowFilters(o=>!o)}
          >
            <span className="icon" aria-hidden>⚲</span>
            <span className="label">Filters</span>
            <span className="count-badge" aria-label={`${filteredPets.length} results`}>{filteredPets.length}</span>
            <span className="chevron" aria-hidden>{showFilters ? '▲' : '▼'}</span>
          </button>
        </div>
        {showFilters && (
        <aside id="filters-panel" className="sidebar-filters" aria-label="Filters and sorting">
          <h2 className="sidebar-title">Filter & Sort</h2>
          <div className="filter-group">
            <label htmlFor="search" className="filter-label">Search</label>
            <input id="search" type="text" placeholder="Search by name" value={searchQuery} onChange={handleSearchChange} />
          </div>
          <div className="filter-group">
            <label htmlFor="type" className="filter-label">Animal Type</label>
            <select id="type" name="type" onChange={handleFilterChange} value={filter.type}>
              <option value="">All</option>
              <option value="Dog">Dog</option>
              <option value="Cat">Cat</option>
              <option value="Bird">Bird</option>
              <option value="Rabbit">Rabbit</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="breed" className="filter-label">Breed</label>
            <select id="breed" name="breed" onChange={handleFilterChange} value={filter.breed}>
              <option value="">All</option>
              <option value="Golden Retriever">Golden Retriever</option>
              <option value="Tabby">Tabby</option>
              <option value="Canary">Canary</option>
              <option value="Angora">Angora</option>
              <option value="Ham">Ham</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="age" className="filter-label">Age</label>
            <select id="age" name="age" onChange={handleFilterChange} value={filter.age}>
              <option value="">All</option>
              <option value="3 years">3 years</option>
              <option value="2 years">2 years</option>
              <option value="1 year">1 year</option>
              <option value="1 years">1 years</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="sort" className="filter-label">Sort</label>
            <select id="sort" name="sort" onChange={handleSortChange} value={sortBy}>
              <option value="name">Name (A–Z)</option>
              <option value="age">Age</option>
            </select>
          </div>
          <div className="filter-actions">
            <button type="button" className="reset-btn" onClick={resetFilters}>Reset</button>
          </div>
          <div className="filter-stats" aria-live="polite">{filteredPets.length} result{filteredPets.length!==1 && 's'}</div>
        </aside>
        )}
  <main className="main-content">
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
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <h2 style={{margin:0}}>Pet Food</h2>
        {isLoggedIn && (effectiveUser?.username?.toLowerCase?.() === 'admin') && (
          <button type="button" className="add-to-cart-btn" onClick={()=> navigate('/admin/add-food')}>Add New Food</button>
        )}
      </div>
      <div className="pet-food-container">
        {foodItems.map((food) => (
          <div
            key={food.id}
            className="pet-food-item clickable-food"
            role="button"
            tabIndex={0}
            aria-disabled={(food.stock ?? 0) <= 0}
            style={(food.stock ?? 0) <= 0 ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
            onClick={(e) => { if ((food.stock ?? 1) > 0) handleAddToCart(food, { event: e }); }}
            onKeyDown={(e) => { if ((food.stock ?? 1) > 0 && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); handleAddToCart(food); } }}
          >
            <img src={food.image} alt={food.name} className="food-image" />
            <h3>{food.name}</h3>
            <p>${Number(food.price).toFixed(2)}</p>
            {(food.stock ?? 0) <= 0 ? (
              <small style={{ color: 'crimson', fontWeight:600 }}>Out of stock</small>
            ) : (
              <small style={{ color: '#666' }}>In stock: {food.stock}</small>
            )}
            {isLoggedIn && (effectiveUser?.username?.toLowerCase?.() === 'admin') && (
              <div style={{marginTop:8}}>
                <button
                  type="button"
                  onClick={async (e)=>{
                    e.stopPropagation();
                    const res = await Swal.fire({ icon:'warning', title:'Remove item?', text:`${food.name}`, showCancelButton:true, confirmButtonText:'Delete' });
                    if (!res.isConfirmed) return;
                    try {
                      const del = await fetch(`http://localhost:5000/api/pet_food/${food.id}`, { method:'DELETE', credentials:'include' });
                      if (!del.ok) { const t = await del.text(); throw new Error((JSON.parse(t)?.error)||'Delete failed'); }
                      setFoodItems(items => items.filter(i=> i.id !== food.id));
                      await Swal.fire({ icon:'success', title:'Deleted' });
                    } catch(err){ await Swal.fire({ icon:'error', title:'Failed', text:String(err.message||err) }); }
                  }}
                  style={{background:'#e53935', color:'#fff', border:'none', padding:'6px 10px', borderRadius:6, cursor:'pointer'}}
                >Remove</button>
              </div>
            )}
          </div>
        ))}
      </div>

  {/* Cart removed – now separate page */}
        </main>
      </div>
    </div>
  );
};

export default PetList;
