import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Home() {
  const [search, setSearch] = useState({ location: '', checkIn: '', checkOut: '' });
  const [hotels, setHotels] = useState([]);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false); // Track if a search occurred
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setHasSearched(false);
    
    if (new Date(search.checkIn) >= new Date(search.checkOut)) {
      return setError('Check-out must be after check-in.');
    }
    if (new Date(search.checkIn) < new Date(new Date().setHours(0,0,0,0))) {
      return setError('Check-in cannot be in the past.');
    }

    try {
      const res = await axios.get('http://localhost:5000/api/hotels', { params: search });
      setHotels(res.data);
      setHasSearched(true); // Mark search as complete
    } catch (err) {
      setError('Failed to fetch hotels.');
    }
  };

  return (
    <>
      <div className="hero">
        <h2>Find your next stay</h2>
        <p className="subtitle">Search hotels, homes, and much more...</p>
        
        <form className="search-pill" onSubmit={handleSearch}>
          <input 
            type="text" 
            placeholder="Where are you going?" 
            required
            onChange={e => setSearch({...search, location: e.target.value})} 
          />
          <input 
            type="text" 
            placeholder="Check In" 
            required 
            onFocus={(e) => (e.target.type = 'date')}
            onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }}
            onChange={e => setSearch({...search, checkIn: e.target.value})} 
          />
          <input 
            type="text" 
            placeholder="Check Out" 
            required 
            onFocus={(e) => (e.target.type = 'date')}
            onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }}
            onChange={e => setSearch({...search, checkOut: e.target.value})} 
          />
          <button type="submit">Search</button>
        </form>
      </div>

      <div className="container">
        {error && <div className="error">{error}</div>}
        
        {/* Empty State Message */}
        {hasSearched && hotels.length === 0 && !error && (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No properties available</h3>
            <p style={{ color: 'var(--text-muted)' }}>The rooms for these dates are currently booked or locked by another user. Try adjusting your dates or location.</p>
          </div>
        )}
        
        {hotels.length > 0 && <h3 style={{ fontSize: '1.8rem', marginBottom: '2rem' }}>Available Properties</h3>}
        
        <div className="hotel-grid">
          {hotels.map(hotel => (
            <div key={hotel.id} className="hotel-card">
              <div className="img-wrapper">
                <img src={`https://picsum.photos/seed/${hotel.id * 105}/800/600`} alt={hotel.name} />
              </div>
              
              <div className="card-content">
                <h3>{hotel.name}</h3>
                <div className="location-tag">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  {hotel.location}
                </div>
                
                <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                  {hotel.description}
                </p>
                
                <div className="amenities">
                  {hotel.amenities.split(',').map((amenity, index) => (
                    <span key={index} className="badge">{amenity.trim()}</span>
                  ))}
                </div>

                <div className="price-row">
                  <div className="price">
                    ₹{hotel.price_per_night} <span>/ night</span>
                  </div>
                  <button onClick={() => navigate('/book', { state: { hotel, ...search } })}>
                    Reserve
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}