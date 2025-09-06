import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const AdminAddFood = () => {
  const navigate = useNavigate();
  const authUser = (()=>{ try { return JSON.parse(localStorage.getItem('auth_user')); } catch { return null; } })();
  const legacyUser = (()=>{ try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();
  const user = authUser || legacyUser;
  const isAdmin = !!user && (user.username?.toLowerCase?.() === 'admin' || user.is_admin === 1);

  const [name, setName] = useState('');
  const [priceStr, setPriceStr] = useState('');
  const [stock, setStock] = useState(0);
  const [expiry, setExpiry] = useState('');
  const [image, setImage] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!isAdmin) {
    return (
      <div style={{padding:20}}>
        <h2>Unauthorized</h2>
        <p>You need admin access to add food items.</p>
      </div>
    );
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name || !priceStr || !image) { setError('Name, price and image are required'); return; }
    const s = Math.max(0, Math.min(20, parseInt(stock, 10) || 0));
    // Normalize and parse price robustly
    let normalized = String(priceStr).trim().replace(/,/g, '.');
    // Allow inputs like '.99' by prefixing 0
    if (/^\.[0-9]+$/.test(normalized)) normalized = '0' + normalized;
    // Extract first number-like token
    const m = normalized.match(/[0-9]*\.?[0-9]+/);
    const price = m ? Number(m[0]) : NaN;
    if (!Number.isFinite(price) || price <= 0) { setError('Enter a valid price'); return; }
    const fd = new FormData();
    fd.append('name', name);
    fd.append('price', price.toFixed(2));
    fd.append('stock', String(s));
    if (expiry) fd.append('expiry_date', expiry);
    fd.append('image', image);
    setBusy(true);
    try {
      const res = await fetch('http://localhost:5000/api/pet_food', { method:'POST', body: fd, credentials: 'include' });
      const txt = await res.text();
      let data = null; try { data = JSON.parse(txt); } catch {}
      if (!res.ok) throw new Error((data?.error) || txt || 'Failed to save');
      await Swal.fire({ icon:'success', title:'Food added' });
      navigate('/');
    } catch(e){ setError(e.message); try { await Swal.fire({ icon:'error', title:'Failed to save', text:String(e.message||e) }); } catch {} }
    finally { setBusy(false); }
  };

  return (
    <div style={{maxWidth:680, margin:'20px auto', padding:'16px', border:'1px solid var(--border-color)', borderRadius:12, background:'var(--bg-surface)'}}>
      <h2 style={{marginTop:0}}>Add New Food</h2>
      <form onSubmit={onSubmit} style={{display:'grid', gap:12}}>
        {!!error && <div style={{color:'crimson', fontSize:13}}>{error}</div>}
        <label style={{display:'grid', gap:6}}>
          <span>Name</span>
          <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="e.g., Crunchy Kibbles" />
        </label>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
          <label style={{display:'grid', gap:6}}>
            <span>Price</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="e.g. 12.50"
              value={priceStr}
              onChange={(e)=> setPriceStr(e.target.value)}
              onBlur={(e)=>{
                const raw = e.target.value || '';
                let v = raw.replace(/,/g, '.');
                // Keep only digits and dots, collapse multiple dots to one, limit 2 decimals for display
                const parts = v.split('.');
                const head = parts.shift()?.replace(/[^0-9]/g, '') || '';
                let tail = parts.join('');
                if (tail) tail = tail.replace(/[^0-9]/g, '').slice(0, 2);
                const out = head + (tail ? '.' + tail : '');
                setPriceStr(out);
              }}
            />
          </label>
          <label style={{display:'grid', gap:6}}>
            <span>Stock (max 20)</span>
            <input
              type="number"
              min="0"
              max="20"
              step="1"
              value={stock}
              onKeyDown={(e)=> ['e','E','+','-'].includes(e.key) && e.preventDefault()}
              onChange={(e)=> {
                const n = Number(e.target.value);
                if (Number.isFinite(n)) setStock(Math.max(0, Math.min(20, n)));
              }}
            />
          </label>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
          <label style={{display:'grid', gap:6}}>
            <span>Expiry date (optional)</span>
            <input type="date" value={expiry} onChange={(e)=> setExpiry(e.target.value)} />
          </label>
          <label style={{display:'grid', gap:6}}>
            <span>Image</span>
            <input type="file" accept="image/*" onChange={(e)=> setImage(e.target.files?.[0]||null)} />
          </label>
        </div>
        <div style={{display:'flex', gap:10, justifyContent:'flex-end'}}>
          <button type="button" onClick={()=> navigate('/')} disabled={busy}>Cancel</button>
          <button className="add-to-cart-btn" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </div>
  );
};

export default AdminAddFood;
