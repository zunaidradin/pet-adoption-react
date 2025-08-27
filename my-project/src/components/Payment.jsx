import React, { useEffect, useState } from 'react';
import './Payment.css';
import { useNavigate } from 'react-router-dom';

const Payment = () => {
  const [cart, setCart] = useState([]);
  const [food, setFood] = useState([]);
  const [method, setMethod] = useState('cod'); // cod | card | bkash | nagad
  const [submitting, setSubmitting] = useState(false);
  const [card, setCard] = useState({ number:'', name:'', expiry:'', cvv:'' });
  const [walletNumber, setWalletNumber] = useState('');
  const [trxId, setTrxId] = useState('');
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
    const needsCard = method === 'card';
    const needsWallet = method === 'bkash' || method === 'nagad';

    if (needsCard) {
      if (!card.number || !card.name || !card.expiry || !card.cvv) {
        alert('Please complete card details');
        return;
      }
    }
    if (needsWallet) {
      if (!walletNumber.trim() || !trxId.trim()) {
        alert('Please enter wallet number and transaction ID');
        return;
      }
    }
    setSubmitting(true);
    setTimeout(() => {
      const methodLabel = method === 'cod' ? 'Cash on Delivery' : method === 'card' ? 'Card' : (method === 'bkash' ? 'bKash' : 'Nagad');
      alert(`Order placed. Payment method: ${methodLabel}`);
      navigate('/');
    }, 900);
  };

  const findName = (item) => {
    if (item.product_type !== 'pet_food') return 'Item';
    const f = food.find(x => String(x.id) === String(item.product_id));
    return f ? f.name : 'Item';
  };

  // Inline SVG logos (data URIs) so it works without extra files; replace with real image paths if available
  const logos = {
    cod: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect rx="8" width="40" height="40" fill="%23f1f5f9"/><path fill="%230d9488" d="M20 8c6.6 0 12 5.4 12 12s-5.4 12-12 12S8 26.6 8 20 13.4 8 20 8Zm0 3.2a8.8 8.8 0 1 0 0 17.6 8.8 8.8 0 0 0 0-17.6Zm-.9 3.3h3.4c1.9 0 3.4 1.5 3.4 3.4 0 1-.4 1.9-1.1 2.5.5.6.8 1.4.8 2.2 0 1.9-1.5 3.4-3.4 3.4h-3.1v-11.5Zm3.2 4.5c.6 0 1.1-.5 1.1-1.1s-.5-1.1-1.1-1.1h-1.1v2.2h1.1Zm.2 4.6c.6 0 1.1-.5 1.1-1.1s-.5-1.1-1.1-1.1h-1.3v2.2h1.3Z"/></svg>',
    card: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect rx="8" width="40" height="40" fill="%23eef2ff"/><rect x="8" y="14" width="24" height="14" rx="3" fill="%234f46e5"/><rect x="10" y="16" width="20" height="2.5" rx="1.25" fill="%23c7d2fe"/><rect x="10" y="20.5" width="10" height="3.5" rx="1.75" fill="%23a5b4fc"/><rect x="22" y="20.5" width="6" height="3.5" rx="1.75" fill="%2393a3fa"/></svg>',
    bkash: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect rx="8" width="40" height="40" fill="%23fff1f7"/><path fill="%23e2136e" d="M21.9 7.6c1 .4 1.6 2.2 1.3 4.2-.3 2.3-1.6 4.9-3.4 7.1 2.9-.6 5.4-.5 7 .3 1.6.8 2.2 2 1.7 3.2-.5 1.3-2 2.5-4.1 3.3-2.1.8-4.7 1.1-7.3.9-2.6-.2-4.9-.9-6.5-1.9-1.6-1-2.3-2.2-1.9-3.4.4-1.2 1.9-2.3 4.1-3.1-.9-2.4-1.1-4.8-.6-6.7.5-2 1.7-3.3 2.9-3.2 1.2.1 2.3 1.7 2.7 4 .2 1.3.2 2.8-.1 4.3 1.3-1.9 2.1-3.9 2.4-5.7.3-1.8.1-3.3-.4-4.3Z"/></svg>',
    nagad: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect rx="8" width="40" height="40" fill="%23fff6e6"/><path fill="%23f59e0b" d="M20 8c6.6 0 12 4.6 12 10.3 0 4.1-3 7.7-7.4 9.3l.9 3.8-4.5-3c-.3 0-.7.1-1 .1-6.6 0-12-4.6-12-10.3S13.4 8 20 8Zm0 3.1c-4.4 0-7.9 2.9-7.9 6.5s3.5 6.5 7.9 6.5c.6 0 1.1-.1 1.7-.2l2.2 1.4-.4-1.9c2.8-1 4.5-3.2 4.5-5.8 0-3.6-3.5-6.5-7.9-6.5Z"/></svg>'
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
                    <td className="grand-value">৳{total.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <form onSubmit={handleSubmit} className="payment-form">
              <fieldset>
                <legend>Payment Method</legend>
                <label className={method==='cod'? 'active': ''}>
                  <input type="radio" name="payment" value="cod" checked={method==='cod'} onChange={()=>setMethod('cod')} />
                  <img className="pay-logo" src={logos.cod} alt="COD" />
                  Cash on Delivery
                </label>
                <label className={method==='card'? 'active': ''}>
                  <input type="radio" name="payment" value="card" checked={method==='card'} onChange={()=>setMethod('card')} />
                  <img className="pay-logo" src={logos.card} alt="Card" />
                  Card
                </label>
                <label className={method==='bkash'? 'active': ''}>
                  <input type="radio" name="payment" value="bkash" checked={method==='bkash'} onChange={()=>{setMethod('bkash'); setCard({ number:'', name:'', expiry:'', cvv:'' });}} />
                  <img className="pay-logo" src={logos.bkash} alt="bKash" />
                  bKash
                </label>
                <label className={method==='nagad'? 'active': ''}>
                  <input type="radio" name="payment" value="nagad" checked={method==='nagad'} onChange={()=>{setMethod('nagad'); setCard({ number:'', name:'', expiry:'', cvv:'' });}} />
                  <img className="pay-logo" src={logos.nagad} alt="Nagad" />
                  Nagad
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
              {(method === 'bkash' || method === 'nagad') && (
                <div className="wallet-fields">
                  <div className="wallet-info-block">
                    <p className="wallet-instructions">
                      Send the total amount to <strong>01XXXXXXXXX</strong> via {method === 'bkash' ? 'bKash' : 'Nagad'}, then enter the wallet number you paid from and the Transaction ID below.
                    </p>
                  </div>
                  <div className="field">
                    <label>{method === 'bkash' ? 'bKash' : 'Nagad'} Wallet Number</label>
                    <input
                      value={walletNumber}
                      onChange={e=> setWalletNumber(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      maxLength={15}
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Transaction ID</label>
                    <input
                      value={trxId}
                      onChange={e=> setTrxId(e.target.value)}
                      placeholder="Example: 8G5HJKL9P"
                      required
                    />
                  </div>
                  <p className="wallet-note">We will verify this payment. Keep your confirmation SMS.</p>
                </div>
              )}
              <div className="summary-line">
                <span>Total Due:</span>
                <strong>৳{total.toFixed(2)}</strong>
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
