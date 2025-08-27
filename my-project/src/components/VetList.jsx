import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './VetList.css';

// Dummy veterinarian data (could be fetched from backend later)
const VETS = [
  { id: 1, name: 'Dr. Ayesha Rahman', specialization: 'Canine & Feline Medicine', phone: '+8801700001111', rating: 4.9, reviews: 128, available: true },
  { id: 2, name: 'Dr. Imran Hossain', specialization: 'Exotic & Avian Care', phone: '+8801712345678', rating: 4.7, reviews: 93, available: false },
  { id: 3, name: 'Dr. Nusrat Jahan', specialization: 'Surgery & Orthopedics', phone: '+8801811223344', rating: 4.8, reviews: 152, available: true },
  { id: 4, name: 'Dr. Farhan Kabir', specialization: 'Dermatology & Allergy', phone: '+8801999887766', rating: 4.5, reviews: 67, available: true },
  { id: 5, name: 'Dr. Shaila Karim', specialization: 'Nutrition & Wellness', phone: '+8801555667788', rating: 4.6, reviews: 81, available: false },
];

const StarRating = ({ value, outOf = 5 }) => {
  const full = Math.floor(value);
  const hasHalf = value - full >= 0.25 && value - full < 0.75; // show half if between .25 and .75
  const stars = [];
  for (let i = 1; i <= outOf; i++) {
    if (i <= full) stars.push(<span key={i} className="star full" aria-hidden>★</span>);
    else if (i === full + 1 && hasHalf) stars.push(<span key={i} className="star half" aria-hidden>★</span>);
    else stars.push(<span key={i} className="star empty" aria-hidden>★</span>);
  }
  return (
    <span className="rating" aria-label={`Rating ${value.toFixed(1)} out of ${outOf}`}>
      {stars} <span className="rating-value">{value.toFixed(1)}</span>
    </span>
  );
};

// Appointment slot helper (start 10:00 AM, 20‑min intervals)
const SLOT_START_HOUR = 10;
const SLOT_MINUTES = 20;
function computeSlot(serial) {
  const offset = (serial - 1) * SLOT_MINUTES;
  const total = SLOT_START_HOUR * 60 + offset;
  const hour24 = Math.floor(total / 60);
  const mins = total % 60;
  const ampm = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = ((hour24 + 11) % 12) + 1;
  return `${hour12}:${String(mins).padStart(2,'0')} ${ampm}`;
}

const VetList = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState({}); // { vetId: { serial, time } }

  const handleBook = (vetId) => {
    setAppointments(prev => {
      if (prev[vetId]) return prev; // already booked
      const serial = Object.keys(prev).length + 1; // simple demo assignment
      const time = computeSlot(serial);
      return { ...prev, [vetId]: { serial, time } };
    });
  };

  return (
    <div className="vet-page">
      <div className="vet-header">
        <h1 className="vet-title">Trusted Veterinarians</h1>
        <p className="vet-subtitle">Connect with experienced vets to support the wellbeing of your beloved companions.</p>
      </div>
      <div className="vet-actions">
        <button type="button" className="back-btn" onClick={() => navigate('/')}>← Back to Pets</button>
      </div>
      <div className="vet-table-wrapper">
        <table className="vet-table" aria-label="Veterinarian directory with ratings and appointment availability">
          <thead>
            <tr>
              <th>Name</th>
              <th>Specialization</th>
              <th>Phone</th>
              <th>Rating</th>
              <th>Reviews</th>
              <th>Appointment</th>
            </tr>
          </thead>
          <tbody>
            {VETS.map(v => {
              const booked = appointments[v.id];
              return (
                <tr key={v.id}>
                  <td data-label="Name">{v.name}</td>
                  <td data-label="Specialization">{v.specialization}</td>
                  <td data-label="Phone"><a href={`tel:${v.phone}`} className="phone-link" rel="noopener noreferrer">{v.phone}</a></td>
                  <td data-label="Rating"><StarRating value={v.rating} /></td>
                  <td data-label="Reviews">{v.reviews}</td>
                  <td data-label="Appointment">
                    {booked ? (
                      <div className="appointment-success" role="status" aria-live="polite">
                        <span className="icon" aria-hidden>✓</span>
                        <div className="text">Visit: {booked.time}<br />Serial #{booked.serial}</div>
                      </div>
                    ) : v.available ? (
                      <button type="button" className="appointment-btn" onClick={() => handleBook(v.id)}>Book Now</button>
                    ) : (
                      <span className="availability-badge unavailable" aria-label="Not available">Not Available</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="vet-footer-note">
        <p>Disclaimer: This is sample data for demonstration. </p>
      </div>
    </div>
  );
};

export default VetList;
