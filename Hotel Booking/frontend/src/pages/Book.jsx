import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Book() {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  const [bookingRef, setBookingRef] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [formData, setFormData] = useState({ guestName: '', guestEmail: '' });
  const [message, setMessage] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);

  const nights = Math.ceil((new Date(state.checkOut) - new Date(state.checkIn)) / (1000 * 60 * 60 * 24));
  const baseAmount = nights * state.hotel.price_per_night;
  const taxes = Math.round(baseAmount * 0.18); // 18% mock tax for realistic UX
  const finalTotal = baseAmount + taxes;

  useEffect(() => {
    axios.post('http://localhost:5000/api/bookings/lock', {
      hotelId: state.hotel.id,
      roomId: state.hotel.room_id,
      checkIn: state.checkIn,
      checkOut: state.checkOut
    }).then(res => {
      setBookingRef(res.data.bookingRef);
      const expires = new Date(res.data.expiresAt).getTime();
      
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const distance = expires - now;
        
        if (distance <= 0) {
          clearInterval(timer);
          setTimeLeft(0);
          setMessage('Session expired. Room released.');
        } else {
          setTimeLeft(Math.floor(distance / 1000));
        }
      }, 1000);
      
      return () => clearInterval(timer);
    }).catch(err => {
      setMessage(err.response?.data?.error || 'Room no longer available.');
    });
  }, [state]);

  const handleConfirm = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/bookings/confirm', {
        bookingRef,
        ...formData
      });
      setIsConfirmed(true);
    } catch (err) {
      setMessage('Failed to confirm. Session may have expired.');
    }
  };

  if (isConfirmed) {
    return (
      <div className="container" style={{ maxWidth: '600px' }}>
        <div className="hotel-card" style={{ padding: '3rem', textAlign: 'center', borderTop: '6px solid #10b981' }}>
          <div style={{ background: '#ecfdf5', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h2 style={{ margin: '0 0 1rem 0' }}>Booking Confirmed</h2>
          <p style={{ color: 'var(--text-muted)' }}>You're going to {state.hotel.location}!</p>
          
          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', margin: '2rem 0', textAlign: 'left', border: '1px dashed #cbd5e1' }}>
            <p style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '600', margin: '0 0 0.5rem 0' }}>Confirmation Code</p>
            <p style={{ fontSize: '1.4rem', fontWeight: '700', margin: 0, color: 'var(--text-main)' }}>{bookingRef}</p>
          </div>
          
          <button onClick={() => navigate('/')}>Return to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '1000px' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Review and pay</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '3rem', alignItems: 'start' }}>
        
        {/* Left Column: Guest Details */}
        <div>
          {timeLeft > 0 && !message ? (
            <form onSubmit={handleConfirm}>
              <div className="hotel-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h3 style={{ margin: '0 0 1.5rem 0' }}>Your details</h3>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>Full Name</label>
                  <input type="text" placeholder="As it appears on your ID" required 
                    onChange={e => setFormData({...formData, guestName: e.target.value})} />
                </div>
                <div>
                  <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>Email Address</label>
                  <input type="email" placeholder="We'll send your receipt here" required 
                    onChange={e => setFormData({...formData, guestEmail: e.target.value})} />
                </div>
              </div>
              
              <button type="submit" style={{ padding: '1.2rem', fontSize: '1.1rem' }}>
                Complete Booking
              </button>
            </form>
          ) : (
            <div className="hotel-card" style={{ padding: '2rem', textAlign: 'center', borderColor: '#fca5a5' }}>
              <p className="error" style={{ fontSize: '1.1rem', margin: '0 0 1.5rem 0' }}>{message}</p>
              <button onClick={() => navigate('/')}>Return to Search</button>
            </div>
          )}
        </div>

        {/* Right Column: Order Summary */}
        <div className="hotel-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem' }}>
            <img src={`https://picsum.photos/seed/${state.hotel.id * 105}/200/200`} alt="Hotel" style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover' }} />
            <div>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{state.hotel.location}</p>
              <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{state.hotel.name}</h4>
            </div>
          </div>
          
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
            <h4 style={{ margin: '0 0 1rem 0' }}>Price details</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
              <span>₹{state.hotel.price_per_night} x {nights} nights</span>
              <span>₹{baseAmount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
              <span>Taxes and fees</span>
              <span>₹{taxes}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', fontWeight: '700', fontSize: '1.2rem', color: 'var(--text-main)' }}>
              <span>Total (INR)</span>
              <span>₹{finalTotal}</span>
            </div>
          </div>

          {timeLeft > 0 && !message && (
             <div style={{ background: '#fef2f2', padding: '1rem 1.5rem', color: '#dc2626', fontWeight: '600', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <span>Room locked for you</span>
               <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
             </div>
          )}
        </div>
        
      </div>
    </div>
  );
}