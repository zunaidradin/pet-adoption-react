import React, { useState } from 'react';
import './Donation.css';
import { useNavigate } from 'react-router-dom';

// Donation page: lets user donate (simplified demo)

const Donation = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [method, setMethod] = useState('bkash'); // card | bkash | nagad
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [card, setCard] = useState({ number:'', name:'', expiry:'', cvv:'' });
  const [walletNumber, setWalletNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [confetti, setConfetti] = useState([]);

  const validate = () => {
    if (!amount || Number(amount) <= 0) return 'Enter a positive amount';
    if (Number(amount) > 10000) return 'Maximum donation is 10000 BDT';
    if (method === 'card') {
      if (!card.number || !card.name || !card.expiry || !card.cvv) return 'Complete card details';
    }
    if (method === 'bkash' || method === 'nagad') {
      if (!walletNumber.trim() || !trxId.trim()) return 'Enter wallet number and transaction ID';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { alert(err); return; }
    setSubmitting(true);
    try {
      const payload = {
        amount: Number(amount),
        method,
        note,
        walletNumber: method==='bkash' || method==='nagad' ? walletNumber : undefined,
        trxId: method==='bkash' || method==='nagad' ? trxId : undefined,
        cardNumber: method==='card' ? card.number : undefined,
        donorName: donorName || undefined,
        donorEmail: donorEmail || undefined,
      };
      const res = await fetch('http://localhost:5000/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      // Some proxies/servers may return HTML on error; guard JSON parse
      let data = null;
      const text = await res.text();
      try { data = JSON.parse(text); } catch { /* non-JSON */ }
      if (!res.ok) throw new Error((data && data.error) || 'Failed to donate');
      // Success animation
      const colors = ['#22c55e','#3b82f6','#eab308','#ef4444','#a855f7'];
      const pieces = Array.from({ length: 18 }).map((_, i) => ({
        left: Math.round(Math.random()*100),
        delay: (Math.random()*0.4).toFixed(2),
        bg: colors[i % colors.length]
      }));
      setConfetti(pieces);
      setShowSuccess(true);
      setTimeout(()=> navigate('/'), 1400);
    } catch (e) {
      alert(e.message);
    } finally { setSubmitting(false); }
  };

  const logos = {
    card: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect rx="8" width="40" height="40" fill="%23eef2ff"/><rect x="8" y="14" width="24" height="14" rx="3" fill="%234f46e5"/><rect x="10" y="16" width="20" height="2.5" rx="1.25" fill="%23c7d2fe"/><rect x="10" y="20.5" width="10" height="3.5" rx="1.75" fill="%23a5b4fc"/><rect x="22" y="20.5" width="6" height="3.5" rx="1.75" fill="%2393a3fa"/></svg>',
    bkash: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect rx="8" width="40" height="40" fill="%23fff1f7"/><path fill="%23e2136e" d="M21.9 7.6c1 .4 1.6 2.2 1.3 4.2-.3 2.3-1.6 4.9-3.4 7.1 2.9-.6 5.4-.5 7 .3 1.6.8 2.2 2 1.7 3.2-.5 1.3-2 2.5-4.1 3.3-2.1.8-4.7 1.1-7.3.9-2.6-.2-4.9-.9-6.5-1.9-1.6-1-2.3-2.2-1.9-3.4.4-1.2 1.9-2.3 4.1-3.1-.9-2.4-1.1-4.8-.6-6.7.5-2 1.7-3.3 2.9-3.2 1.2.1 2.3 1.7 2.7 4 .2 1.3.2 2.8-.1 4.3 1.3-1.9 2.1-3.9 2.4-5.7.3-1.8.1-3.3-.4-4.3Z"/></svg>',
    nagad: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect rx="8" width="40" height="40" fill="%23fff6e6"/><path fill="%23f59e0b" d="M20 8c6.6 0 12 4.6 12 10.3 0 4.1-3 7.7-7.4 9.3l-.9 3.8-4.5-3c-.3 0-.7.1-1 .1-6.6 0-12-4.6-12-10.3S13.4 8 20 8Zm0 3.1c-4.4 0-7.9 2.9-7.9 6.5s3.5 6.5 7.9 6.5c.6 0 1.1-.1 1.7-.2l2.2 1.4-.4-1.9c2.8-1 4.5-3.2 4.5-5.8 0-3.6-3.5-6.5-7.9-6.5Z"/></svg>'
  };

  return (
    <div className="donation-page">
      <button type="button" onClick={()=>navigate(-1)} className="back-btn" style={{marginBottom:'14px'}}>← Back</button>
      <h1 className="donation-title">Donate to Support Animals</h1>
      <p className="intro">Your contribution helps provide food, shelter, and medical care for rescue animals.</p>
      <form className="donation-form" onSubmit={handleSubmit}>
        <div className="field-group">
          <label>Donation Amount (BDT)</label>
          <input type="number" min="1" max="10000" step="0.01" value={amount} onChange={e=> setAmount(e.target.value)} placeholder="500" required />
        </div>
        <div className="field-group">
          <label>Your Name (optional)</label>
          <input value={donorName} onChange={e=> setDonorName(e.target.value)} placeholder="Jane Doe" />
        </div>
        <div className="field-group">
          <label>Your Email (optional)</label>
          <input type="email" value={donorEmail} onChange={e=> setDonorEmail(e.target.value)} placeholder="jane@example.com" />
        </div>
        <div className="field-group">
          <label>Message (optional)</label>
          <textarea value={note} onChange={e=> setNote(e.target.value)} placeholder="In memory of..." rows={3} />
        </div>
        <fieldset className="method-fieldset">
          <legend>Payment Method</legend>
          {['card','bkash','nagad'].map(val => (
            <label key={val} className={method===val? 'active': ''}>
              <input type="radio" name="method" value={val} checked={method===val} onChange={()=>setMethod(val)} />
              <img className="pay-logo" src={logos[val]} alt={val} />
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
            <p className="wallet-instructions">Send <strong>৳{Math.min(Number(amount||0),10000)}</strong> to <strong>01XXXXXXXXX</strong> ({method === 'bkash' ? 'bKash' : 'Nagad'}) then enter the details below.</p>
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
      </form>
      {showSuccess && (
        <div className="donation-success-overlay" role="status" aria-live="polite">
          <div className="success-card">
            <div className="success-icon">✓</div>
            <h3 className="success-title">Thanks for being with us</h3>
            <p className="success-sub">Donation successful</p>
          </div>
          <div className="confetti-wrap">
            {confetti.map((c, idx)=> (
              <span key={idx} className="confetti" style={{ left: c.left+'%', background:c.bg, animationDelay: c.delay+'s' }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Donation;
