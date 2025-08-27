import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CartPage.css';

const CartPage = () => {
  const navigate = useNavigate();
  const authUser = (() => { try { return JSON.parse(localStorage.getItem('auth_user')); } catch { return null; } })();
  const legacyUser = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();
  const effectiveUser = authUser || legacyUser;
  const userId = effectiveUser?.id;
  const username = effectiveUser?.username || effectiveUser?.email || 'User';
  const isLoggedIn = !!effectiveUser;

  const [cart, setCart] = useState([]); // normalized rows
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(()=> { if (!isLoggedIn) navigate('/login'); }, [isLoggedIn, navigate]);

  const fetchFood = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/pet_food');
      const data = await res.json();
      if (Array.isArray(data)) setFoodItems(data);
    } catch(e) { /* ignore */ }
  };

  const fetchCart = async () => {
    if(!userId) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch(`http://localhost:5000/api/cart?userId=${encodeURIComponent(userId)}`);
      if(!res.ok) throw new Error('Failed to load cart');
      const raw = await res.json();
      const items = Array.isArray(raw) ? raw : Array.isArray(raw.data) ? raw.data : Array.isArray(raw.rows) ? raw.rows : Array.isArray(raw.cart) ? raw.cart : [];
      const normalized = items.map(it => ({
        id: it.id,
        user_id: it.user_id ?? it.userId,
        product_id: it.product_id ?? it.productId,
        product_type: it.product_type ?? it.productType,
        quantity: Number(it.quantity ?? 1),
        price: Number(it.price ?? 0)
      }));
      setCart(normalized);
    } catch(e) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  useEffect(()=> { fetchFood(); }, []);
  useEffect(()=> { if(userId) fetchCart(); }, [userId]);

  const handleRemove = async (itemId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/cart/${itemId}?userId=${encodeURIComponent(userId)}`, { method:'DELETE' });
      if(!res.ok) throw new Error('Delete failed');
      fetchCart();
    } catch(e) { setError(e.message); }
  };

  const total = cart.reduce((s,i)=> s + i.price * (i.quantity||1),0);
  const totalQty = cart.reduce((s,i)=> s + (i.quantity||1),0);

  return (
    <div className="cart-page">
      <header className="cart-header">
        <div className="cart-header-left">
          <button type="button" className="back-link" onClick={()=> navigate('/')}>← Continue Browsing</button>
          <h1 className="cart-title">Your Cart</h1>
        </div>
        <div className="cart-meta">{totalQty} item{totalQty!==1 && 's'} • ${total.toFixed(2)}</div>
      </header>

      {loading && <div className="cart-status">Loading cart...</div>}
      {error && <div className="cart-error" role="alert">{error}</div>}

      {!loading && cart.length === 0 && (
        <div className="cart-empty-panel">
          <p className="empty-head">Your cart is empty</p>
          <p className="empty-sub">Add nutritious food or supplies for your future companion.</p>
          <button type="button" className="browse-btn" onClick={()=> navigate('/')}>Browse Pets & Food</button>
        </div>
      )}

      {cart.length > 0 && (
        <div className="cart-table-wrapper pro">
          <table className="cart-table" aria-label="Shopping cart detail table">
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
                const product = item.product_type === 'pet_food' ? foodItems.find(f => String(f.id) === String(item.product_id)) : null;
                const name = product ? product.name : 'Item';
                const unit = Number(item.price)||0; const qty = item.quantity||1; const subtotal = unit*qty;
                return (
                  <tr key={item.id}>
                    <td data-label="Item">{name}</td>
                    <td data-label="Qty" className="qty-col">{qty}</td>
                    <td data-label="Unit Price">${unit.toFixed(2)}</td>
                    <td data-label="Subtotal">${subtotal.toFixed(2)}</td>
                    <td className="action-col">
                      <button type="button" className="remove-btn" onClick={()=>handleRemove(item.id)}>Remove</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" className="total-label">Total</td>
                <td colSpan="2" className="total-value">${total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {cart.length > 0 && (
        <div className="cart-actions">
          <button type="button" className="checkout-btn" onClick={()=> navigate('/payment')}>Proceed to Checkout</button>
        </div>
      )}
    </div>
  );
};

export default CartPage;
