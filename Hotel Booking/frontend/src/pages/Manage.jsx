import { useState } from 'react';
import axios from 'axios';

export default function Manage() {
  const [creds, setCreds] = useState({ ref: '', email: '' });
  const [booking, setBooking] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchBooking = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/bookings/${creds.ref}?email=${creds.email}`);
      setBooking(res.data);
    } catch (err) {
      setMessage('We couldn’t find a confirmed booking with those details.');
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async () => {
    if (!window.confirm('Are you absolutely sure you want to cancel? This action cannot be undone and the room will be released immediately.')) return;
    try {
      await axios.delete(`http://localhost:5000/api/bookings/${creds.ref}?email=${creds.email}`);
      setMessage('Your booking has been successfully cancelled.');
      setBooking(null);
      setCreds({ ref: '', email: '' }); // clear form
    } catch (err) {
      setMessage('Failed to process cancellation. Please try again.');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '700px', marginTop: '3rem' }}>
      
      {!booking ? (
        <div className="hotel-card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 0.5rem 0' }}>Find your reservation</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Enter your booking reference and email to view or cancel your stay.</p>
          
          <form onSubmit={fetchBooking} style={{ maxWidth: '400px', margin: '0 auto' }}>
            <input type="text" placeholder="Booking Reference (e.g. 123e4567-...)" required 
              value={creds.ref}
              onChange={e => setCreds({...creds, ref: e.target.value})} 
              style={{ marginBottom: '1rem', textAlign: 'center' }} />
            <input type="email" placeholder="Email used for booking" required 
              value={creds.email}
              onChange={e => setCreds({...creds, email: e.target.value})} 
              style={{ marginBottom: '1.5rem', textAlign: 'center' }} />
            
            <button type="submit" disabled={loading}>
              {loading ? 'Searching...' : 'Retrieve Booking'}
            </button>
          </form>
          {message && <p className={message.includes('successfully') ? 'success' : 'error'} style={{ marginTop: '2rem' }}>{message}</p>}
        </div>
      ) : (
        <div style={{ animation: 'fadeIn 0.4s ease-in-out' }}>
          <button onClick={() => setBooking(null)} style={{ background: 'transparent', color: 'var(--text-muted)', padding: 0, width: 'auto', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ← Back to search
          </button>
          
          {/* Digital Receipt Card */}
          <div className="hotel-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ background: 'var(--primary)', color: 'white', padding: '2rem' }}>
              <p style={{ margin: '0 0 0.5rem 0', opacity: 0.9, textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>Confirmed Reservation</p>
              <h2 style={{ margin: 0, fontSize: '2.2rem' }}>{booking.hotel_name}</h2>
              <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>📍 {booking.location}</p>
            </div>
            
            <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', borderBottom: '2px dashed var(--border)' }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 0.25rem 0' }}>Check-in</p>
                <p style={{ fontWeight: '600', fontSize: '1.1rem', margin: 0 }}>{new Date(booking.check_in_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 0.25rem 0' }}>Check-out</p>
                <p style={{ fontWeight: '600', fontSize: '1.1rem', margin: 0 }}>{new Date(booking.check_out_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 0.25rem 0' }}>Guest</p>
                <p style={{ fontWeight: '600', fontSize: '1.1rem', margin: 0 }}>{booking.guest_name}</p>
              </div>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 0.25rem 0' }}>Booking Ref</p>
                <p style={{ fontWeight: '600', fontSize: '1.1rem', margin: 0, color: 'var(--primary)' }}>{booking.booking_ref.split('-')[0].toUpperCase()}</p>
              </div>
            </div>

            <div style={{ padding: '2rem', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 0.25rem 0' }}>Total Amount Paid</p>
                <p style={{ fontWeight: '700', fontSize: '1.5rem', margin: 0 }}>₹{booking.total_amount}</p>
              </div>
              
              <button 
                onClick={cancelBooking}
                style={{ background: 'white', color: '#ef4444', border: '1px solid #ef4444', width: 'auto', padding: '0.8rem 1.5rem' }}>
                Cancel Reservation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}