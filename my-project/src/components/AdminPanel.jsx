import React, { useEffect, useState, useCallback } from 'react';
import './AdminPanel.css';

const AdminPanel = () => {
	const [pending, setPending] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [actionMsg, setActionMsg] = useState('');

	const loadPending = useCallback(async () => {
		setLoading(true); setError('');
		try {
			const res = await fetch('http://localhost:5000/api/admin/pending-pets', { credentials: 'include' });
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || 'Failed to load');
			setPending(Array.isArray(data) ? data : []);
		} catch (e) { setError(e.message); }
		finally { setLoading(false); }
	}, []);

	useEffect(()=>{ loadPending(); }, [loadPending]);

	const doAction = async (id, action) => {
		setActionMsg('');
		try {
			const endpoint = `http://localhost:5000/api/admin/pending-pets/${id}/${action}`;
			const res = await fetch(endpoint, { method: 'POST', credentials:'include' });
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || 'Action failed');
			setActionMsg(action === 'approve' ? 'Approved successfully' : 'Rejected');
			setPending(p => p.filter(item => item.id !== id));
		} catch (e) { setActionMsg(e.message); }
	};

	return (
		<div className="admin-panel">
			<h1 className="admin-title">Admin Panel</h1>
			<p className="admin-intro">Review and approve pending pet submissions.</p>
			<div className="admin-sections single-col">
				<div className="admin-card">
					<h3>Pending Approvals</h3>
					{loading && <p>Loading…</p>}
					{error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
					{actionMsg && <p style={{ color: 'var(--accent)' }}>{actionMsg}</p>}
					{!loading && !pending.length && !error && <p>No pending submissions.</p>}
					{pending.length > 0 && (
						<table className="pending-table">
							<thead>
								<tr>
									<th>ID</th>
									<th>Name</th>
									<th>Type</th>
									<th>Breed</th>
									<th>Age</th>
									<th>Image</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{pending.map(p => (
									<tr key={p.id}>
										<td>{p.id}</td>
										<td>{p.name}</td>
										<td>{p.animalType}</td>
										<td>{p.breed}</td>
										<td>{p.age}</td>
										<td>{p.image ? <img src={p.image} alt={p.name} style={{width:50,height:40,objectFit:'cover',borderRadius:4}} /> : '-'}</td>
										<td style={{display:'flex', gap:6}}>
											<button className="approve-btn" onClick={()=>doAction(p.id,'approve')}>Approve</button>
											<button className="reject-btn" onClick={()=>doAction(p.id,'reject')}>Reject</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</div>
			</div>
		</div>
	);
};

export default AdminPanel;
