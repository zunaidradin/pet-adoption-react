import React, { useState } from 'react';
import './Donation.css';
import { useNavigate } from 'react-router-dom';

// Donation page: lets user donate toward a chosen animal category using same methods as checkout
// If this page was blank before, this simplified component + console log should help debug.

const Donation = () => {
  console.log('[Donation] component mounted');
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [animalType, setAnimalType] = useState('Dog');
  const [note, setNote] = useState('');
  const [method, setMethod] = useState('bkash'); // cod | card | bkash | nagad
  const [card, setCard] = useState({ number:'', name:'', expiry:'', cvv:'' });
  const [walletNumber, setWalletNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (!amount || Number(amount) <= 0) return 'Enter a positive amount';
    if (method === 'card') {
      if (!card.number || !card.name || !card.expiry || !card.cvv) return 'Complete card details';
    }
    if (method === 'bkash' || method === 'nagad') {
      if (!walletNumber.trim() || !trxId.trim()) return 'Enter wallet number and transaction ID';
    }
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { alert(err); return; }
    setSubmitting(true);
    setTimeout(() => {
      alert(`Thank you! Donation of $${Number(amount).toFixed(2)} for ${animalType} via ${method}`);
      navigate('/');
    }, 900);
  };

  const logos = {
    cod: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect rx="8" width="40" height="40" fill="%23f1f5f9"/><path fill="%230d9488" d="M20 8c6.6 0 12 5.4 12 12s-5.4 12-12 12S8 26.6 8 20 13.4 8 20 8Zm0 3.2a8.8 8.8 0 1 0 0 17.6 8.8 8.8 0 0 0 0-17.6Zm-.9 3.3h3.4c1.9 0 3.4 1.5 3.4 3.4 0 1-.4 1.9-1.1 2.5.5.6.8 1.4.8 2.2 0 1.9-1.5 3.4-3.4 3.4h-3.1v-11.5Zm3.2 4.5c.6 0 1.1-.5 1.1-1.1s-.5-1.1-1.1-1.1h-1.1v2.2h1.1Zm.2 4.6c.6 0 1.1-.5 1.1-1.1s-.5-1.1-1.1-1.1h-1.3v2.2h1.3Z"/></svg>',
    card: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect rx="8" width="40" height="40" fill="%23eef2ff"/><rect x="8" y="14" width="24" height="14" rx="3" fill="%234f46e5"/><rect x="10" y="16" width="20" height="2.5" rx="1.25" fill="%23c7d2fe"/><rect x="10" y="20.5" width="10" height="3.5" rx="1.75" fill="%23a5b4fc"/><rect x="22" y="20.5" width="6" height="3.5" rx="1.75" fill="%2393a3fa"/></svg>',
    bkash: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect rx="8" width="40" height="40" fill="%23fff1f7"/><path fill="%23e2136e" d="M21.9 7.6c1 .4 1.6 2.2 1.3 4.2-.3 2.3-1.6 4.9-3.4 7.1 2.9-.6 5.4-.5 7 .3 1.6.8 2.2 2 1.7 3.2-.5 1.3-2 2.5-4.1 3.3-2.1.8-4.7 1.1-7.3.9-2.6-.2-4.9-.9-6.5-1.9-1.6-1-2.3-2.2-1.9-3.4.4-1.2 1.9-2.3 4.1-3.1-.9-2.4-1.1-4.8-.6-6.7.5-2 1.7-3.3 2.9-3.2 1.2.1 2.3 1.7 2.7 4 .2 1.3.2 2.8-.1 4.3 1.3-1.9 2.1-3.9 2.4-5.7.3-1.8.1-3.3-.4-4.3Z"/></svg>',
    nagad: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect rx="8" width="40" height="40" fill="%23fff6e6"/><path fill="%23f59e0b" d="M20 8c6.6 0 12 4.6 12 10.3 0 4.1-3 7.7-7.4 9.3l.9 3.8-4.5-3c-.3 0-.7.1-1 .1-6.6 0-12-4.6-12-10.3S13.4 8 20 8Zm0 3.1c-4.4 0-7.9 2.9-7.9 6.5s3.5 6.5 7.9 6.5c.6 0 1.1-.1 1.7-.2l2.2 1.4-.4-1.9c2.8-1 4.5-3.2 4.5-5.8 0-3.6-3.5-6.5-7.9-6.5Z"/></svg>'
  };

  return (
    <div className="donation-page">
  <h1 className="donation-title">Donate to Support Animals</h1>
  <p className="intro">Your contribution helps provide food, shelter, and medical care for dogs, cats, and other rescue animals.</p>
      <form className="donation-form" onSubmit={handleSubmit}>
        <div className="field-group">
          <label>Donation Amount (BDT)</label>
          <input type="number" min="1" step="0.01" value={amount} onChange={e=> setAmount(e.target.value)} placeholder="500" required />
        </div>
        <div className="field-group">
          <label>Animal Category</label>
          <select value={animalType} onChange={e=> setAnimalType(e.target.value)}>
            <option value="Dog">Dogs</option>
            <option value="Cat">Cats</option>
            <option value="Bird">Birds</option>
            <option value="Rabbit">Rabbits</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="field-group">
          <label>Message (optional)</label>
          <textarea value={note} onChange={e=> setNote(e.target.value)} placeholder="In memory of..." rows={3} />
        </div>
  <fieldset className="method-fieldset">
          <legend>Payment Method</legend>
          {['cod','card','bkash','nagad'].map(val => (
            <label key={val} className={method===val? 'active': ''}>
              <input type="radio" name="method" value={val} checked={method===val} onChange={()=>setMethod(val)} />
              <img className="pay-logo" src={logos[val]} alt={val} />
              {val === 'cod' && 'Cash on Delivery'}
              {val === 'card' && 'Card'}
              {val === 'bkash' && 'bKash'}
              {val === 'nagad' && 'Nagad'}
            </label>
          ))}
        </fieldset>
        {method === 'card' && (
          <div className="card-fields alt">
            <div className="field">
              <label>Card Number</label>
              <input value={card.number} onChange={e=> setCard(c=> ({...c, number: e.target.value}))} placeholder="1234 5678 9012 3456" required />
            </div>
            <div className="field">
              <label>Name on Card</label>
              <input value={card.name} onChange={e=> setCard(c=> ({...c, name: e.target.value}))} required />
            </div>
            <div className="row">
              <div className="field small">
                <label>Expiry</label>
                <input value={card.expiry} onChange={e=> setCard(c=> ({...c, expiry: e.target.value}))} placeholder="MM/YY" required />
              </div>
              <div className="field small">
                <label>CVV</label>
                <input value={card.cvv} onChange={e=> setCard(c=> ({...c, cvv: e.target.value}))} maxLength={4} required />
              </div>
            </div>
          </div>
        )}
        {(method === 'bkash' || method === 'nagad') && (
          <div className="wallet-fields alt">
            <p className="wallet-instructions">Send <strong>৳{amount || '0'}</strong> to <strong>01XXXXXXXXX</strong> ({method === 'bkash' ? 'bKash' : 'Nagad'}) then enter the details below.</p>
            <div className="field">
              <label>Wallet Number</label>
              <input value={walletNumber} onChange={e=> setWalletNumber(e.target.value)} placeholder="01XXXXXXXXX" required />
            </div>
            <div className="field">
              <label>Transaction ID</label>
              <input value={trxId} onChange={e=> setTrxId(e.target.value)} placeholder="8G5HJKL9P" required />
            </div>
          </div>
        )}
        <div className="summary-line donation">
          <span>Total Donation:</span>
          <strong>৳{Number(amount||0).toFixed(2)}</strong>
        </div>
  <button type="submit" className="donate-btn" disabled={submitting}>{submitting ? 'Processing...' : 'Donate Now'}</button>
        <button type="button" className="cancel-btn" onClick={()=> navigate(-1)}>Back</button>
      </form>
    </div>
  );
};

export default Donation;
