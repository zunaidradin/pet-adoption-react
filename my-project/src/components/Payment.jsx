import React, { useEffect, useState } from 'react';
import './Payment.css';
import { useNavigate } from 'react-router-dom';

const Payment = () => {
  const [cart, setCart] = useState([]);
  const [food, setFood] = useState([]);
  const [method, setMethod] = useState('cod');
  const [submitting, setSubmitting] = useState(false);
  const [card, setCard] = useState({ number:'', name:'', expiry:'', cvv:'' });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const authUser = (()=>{ try { return JSON.parse(localStorage.getItem('auth_user')); } catch { return null; } })();
  const legacyUser = (()=>{ try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();
  const user = authUser || legacyUser;
  const userId = user?.id;

  useEffect(() => {
    if (!userId) { navigate('/login'); return; }
    const load = async () => {
      try {
        const [cartRes, foodRes] = await Promise.all([
          fetch(`http://localhost:5000/api/cart?userId=${encodeURIComponent(userId)}`),
          fetch('http://localhost:5000/api/pet_food')
        ]);
        const cartData = await cartRes.json();
        const foodData = await foodRes.json();
        setCart(Array.isArray(cartData)? cartData: []);
        setFood(Array.isArray(foodData)? foodData: []);
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [userId, navigate]);

  const total = cart.reduce((s,i)=> s + (i.price * (i.quantity||1)),0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (method === 'card') {
      // minimal client validation
      if (!card.number || !card.name || !card.expiry || !card.cvv) {
        alert('Please complete card details');
        return;
      }
    }
    setSubmitting(true);
    setTimeout(() => {
      alert(`Order placed. Payment method: ${method === 'cod' ? 'Cash on Delivery' : 'Card'}`);
      navigate('/');
    }, 900);
  };

  const findName = (item) => {
    if (item.product_type !== 'pet_food') return 'Item';
    const f = food.find(x => String(x.id) === String(item.product_id));
    return f ? f.name : 'Item';
  };

  return (
    <div className="payment-page">
      <h1>Checkout</h1>
      {loading ? <p>Loading cart...</p> : (
        cart.length === 0 ? <p>Your cart is empty.</p> : (
          <div className="receipt-wrapper">
            <div className="receipt">
              <div className="receipt-header">
                <h2>Order Summary</h2>
                <span className="order-meta">Items: {cart.reduce((s,i)=>s + (i.quantity||1),0)}</span>
              </div>
              <table className="receipt-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Unit</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map(it => {
                    const name = findName(it);
                    const qty = it.quantity || 1;
                    const unit = Number(it.price)||0;
                    const sub = unit * qty;
                    return (
                      <tr key={it.id}>
                        <td>{name}</td>
                        <td>{qty}</td>
                        <td>${unit.toFixed(2)}</td>
                        <td>${sub.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" className="grand-label">Grand Total</td>
                    <td className="grand-value">${total.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <form onSubmit={handleSubmit} className="payment-form">
              <fieldset>
                <legend>Payment Method</legend>
                <label className={method==='cod'? 'active': ''}>
                  <input type="radio" name="payment" value="cod" checked={method==='cod'} onChange={()=>setMethod('cod')} />
                  Cash on Delivery
                </label>
                <label className={method==='card'? 'active': ''}>
                  <input type="radio" name="payment" value="card" checked={method==='card'} onChange={()=>setMethod('card')} />
                  Card Payment
                </label>
              </fieldset>
              {method === 'card' && (
                <div className="card-fields">
                  <div className="field">
                    <label>Card Number</label>
                    <input
                      maxLength={19}
                      value={card.number}
                      onChange={e=> setCard(c=> ({...c, number: e.target.value.replace(/[^0-9 ]/g,'').replace(/(\d{4})/g,'$1 ').trim()}))}
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Name on Card</label>
                    <input
                      value={card.name}
                      onChange={e=> setCard(c=> ({...c, name: e.target.value}))}
                      required
                    />
                  </div>
                  <div className="field-row">
                    <div className="field small">
                      <label>Expiry</label>
                      <input
                        value={card.expiry}
                        onChange={e=> setCard(c=> ({...c, expiry: e.target.value}))}
                        placeholder="MM/YY"
                        pattern="^(0[1-9]|1[0-2])\/(\d{2})$"
                        required
                      />
                    </div>
                    <div className="field small">
                      <label>CVV</label>
                      <input
                        value={card.cvv}
                        onChange={e=> setCard(c=> ({...c, cvv: e.target.value.replace(/[^0-9]/g,'')}))}
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
              <div className="summary-line">
                <span>Total Due:</span>
                <strong>${total.toFixed(2)}</strong>
              </div>
              <button type="submit" disabled={submitting} className="place-order-btn">
                {submitting ? 'Processing...' : 'Place Order'}
              </button>
              <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>Back</button>
            </form>
          </div>
        )
      )}
    </div>
  );
};

export default Payment;
