import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

import PetList from './components/PetList';
import PetDetail from './components/PetDetail';
import AdoptPet from './components/AdoptPet';
import AddPetForm from './components/AddPetForm';
import Login from './components/Login';
import Registration from './components/Registration';

// OPTIONAL: If you have a CartPanel component, import it and render it in a layout.
// import CartPanel from './components/CartPanel';

const App = () => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  // ---- LIFTED CART STATE (single source of truth) ----
  const [cart, setCart] = useState([]); // [{id, name, price, qty}]

  const addToCart = (item) => {
    setCart(prev => {
      const i = prev.findIndex(p => p.id === item.id);
      if (i > -1) {
        const next = [...prev];
        next[i] = { ...next[i], qty: next[i].qty + 1 };
        return next;
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(p => p.id !== id));
  const clearCart = () => setCart([]);
  const total = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart]);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isLoggedIn
              ? (
                // If you have a layout with a right-side cart, render it here and pass props down.
                // <Layout right={<CartPanel cart={cart} total={total} onRemove={removeFromCart} onClear={clearCart}/>}>
                //   <PetList onAddToCart={addToCart} cart={cart} />
                // </Layout>
                <PetList onAddToCart={addToCart} cart={cart} total={total} />
              )
              : <Navigate to="/login" />
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/pet/:id" element={<PetDetail onAddToCart={addToCart} cart={cart} />} />
        <Route path="/adopt/:id" element={<AdoptPet />} />
        {isLoggedIn && <Route path="/admin/add-pet" element={<AddPetForm />} />}
      </Routes>
    </Router>
  );
};

createRoot(document.getElementById('root')).render(<App />);
